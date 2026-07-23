import { useState, useEffect, useRef } from 'react';
import { pharmacyApi } from '../../../api/pharmacy.api';
import PharmacyInvoicePrint from './PharmacyInvoicePrint';
import toast from 'react-hot-toast';

export default function PharmacyDashboardPage() {
  const [queue, setQueue] = useState([]);
  const [activeRx, setActiveRx] = useState(null);
  const [cart, setCart] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showAlternativesFor, setShowAlternativesFor] = useState(null);

  const [invoice, setInvoice] = useState(null);
  const [showPrint, setShowPrint] = useState(false);
  const printRef = useRef(null);
  
  // Barcode scanner listener
  const barcodeBuffer = useRef('');
  const barcodeTimeout = useRef(null);

  useEffect(() => {
    fetchQueue();
    
    // Global barcode listener
    const handleKeyDown = (e) => {
      // Ignore if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (e.target.id !== 'barcode-hidden-input') return; // Allow if it's our hidden input
      }

      if (e.key === 'Enter') {
        if (barcodeBuffer.current.length > 3) {
          handleBarcodeScanned(barcodeBuffer.current);
        }
        barcodeBuffer.current = '';
        clearTimeout(barcodeTimeout.current);
      } else if (e.key.length === 1) { // Normal char
        barcodeBuffer.current += e.key;
        clearTimeout(barcodeTimeout.current);
        // Clear buffer if typing is too slow (not a scanner)
        barcodeTimeout.current = setTimeout(() => {
          barcodeBuffer.current = '';
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchQueue = async () => {
    try {
      const { data } = await pharmacyApi.getQueue();
      setQueue(data.data || []);
    } catch (err) {
      toast.error('Failed to load prescriptions queue');
    }
  };

  const searchInventory = async (q, isGeneric = false) => {
    try {
      const { data } = await pharmacyApi.searchInventory(q);
      setSearchResults(data.data || []);
      if (isGeneric) setShowAlternativesFor(q);
    } catch (err) {
      toast.error('Search failed');
    }
  };

  const handleBarcodeScanned = async (code) => {
    try {
      const { data } = await pharmacyApi.searchInventory(code);
      if (data.data && data.data.length > 0) {
        addToCart(data.data[0]);
        toast.success(`Added ${data.data[0].brandName}`);
      } else {
        toast.error('Barcode not found in inventory');
      }
    } catch (err) {
      toast.error('Barcode scan failed');
    }
  };

  const addToCart = (inventoryItem) => {
    if (inventoryItem.stockQuantity <= 0) {
      return toast.error('Item is out of stock!');
    }
    
    setCart(prev => {
      const existing = prev.find(i => i.inventoryId === inventoryItem._id);
      if (existing) {
        if (existing.quantity >= inventoryItem.stockQuantity) {
          toast.error('Cannot exceed available stock');
          return prev;
        }
        return prev.map(i => i.inventoryId === inventoryItem._id 
          ? { ...i, quantity: i.quantity + 1 } 
          : i
        );
      }
      return [...prev, { 
        inventoryId: inventoryItem._id, 
        brandName: inventoryItem.brandName,
        genericName: inventoryItem.genericName,
        unitPrice: inventoryItem.unitPrice,
        taxPercentage: inventoryItem.taxPercentage,
        maxStock: inventoryItem.stockQuantity,
        quantity: 1 
      }];
    });
    setSearchResults([]);
    setSearchQuery('');
    setShowAlternativesFor(null);
  };

  const updateCartQty = (idx, qty) => {
    if (qty < 1) return;
    setCart(prev => {
      const newCart = [...prev];
      if (qty > newCart[idx].maxStock) {
        toast.error('Cannot exceed available stock');
        return prev;
      }
      newCart[idx].quantity = qty;
      return newCart;
    });
  };

  const removeFromCart = (idx) => {
    setCart(prev => prev.filter((_, i) => i !== idx));
  };

  const processSale = async () => {
    if (cart.length === 0) return toast.error('Cart is empty');

    const payload = {
      prescriptionId: activeRx ? activeRx._id : undefined,
      patientId: activeRx ? activeRx.patientId._id : undefined,
      items: cart.map(c => ({ inventoryId: c.inventoryId, quantity: c.quantity }))
    };

    try {
      const { data } = await pharmacyApi.dispense(payload);
      toast.success('Sale processed successfully!');
      setInvoice(data.data);
      setShowPrint(true);
      
      // Reset
      setCart([]);
      setActiveRx(null);
      fetchQueue();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process sale');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Cart calculations
  const subTotal = cart.reduce((acc, c) => acc + (c.unitPrice * c.quantity), 0);
  const taxTotal = cart.reduce((acc, c) => acc + ((c.unitPrice * c.quantity * c.taxPercentage) / 100), 0);
  const grandTotal = subTotal + taxTotal;

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6 p-4 h-[calc(100vh-80px)] flex flex-col print:hidden">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pharmacy POS</h1>
          <p className="text-gray-500">Dispensing & Billing</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-bold text-gray-700">Scanner Ready</span>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        
        {/* Left Col: Incoming Prescriptions */}
        <div className="w-1/3 flex flex-col gap-4 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold flex justify-between">
              <span>Incoming e-Rx Queue</span>
              <span className="bg-primary-100 text-primary-700 px-2 rounded text-sm">{queue.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {queue.map(rx => (
                <div 
                  key={rx._id} 
                  onClick={() => setActiveRx(rx)}
                  className={`p-3 rounded-xl border cursor-pointer transition-colors ${activeRx?._id === rx._id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-gray-900">{rx.patientId?.firstName} {rx.patientId?.lastName}</span>
                    <span className="text-xs text-gray-500">{new Date(rx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">Dr. {rx.doctorId?.lastName}</div>
                  <div className="flex flex-wrap gap-1">
                    {rx.medicines.map((m, i) => (
                      <span key={i} className="text-[10px] bg-gray-100 px-2 py-1 rounded">{m.name}</span>
                    ))}
                  </div>
                </div>
              ))}
              {queue.length === 0 && <div className="text-center text-gray-400 mt-4 text-sm">No pending prescriptions</div>}
            </div>
          </div>
        </div>

        {/* Right Col: POS Terminal */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          
          {/* Active Rx Header */}
          {activeRx && (
            <div className="p-4 bg-yellow-50 border-b border-yellow-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-yellow-800">Processing: {activeRx.patientId?.firstName} {activeRx.patientId?.lastName}</h3>
                <p className="text-xs text-yellow-600">Please scan or search for the prescribed items below.</p>
              </div>
              <button onClick={() => setActiveRx(null)} className="text-yellow-800 text-sm underline">Clear</button>
            </div>
          )}

          {/* Search & Suggestions */}
          <div className="p-4 border-b border-gray-100 flex flex-col gap-2 relative">
            <input 
              type="text" 
              className="input w-full" 
              placeholder="Search by Brand Name, Generic Name, or Barcode..." 
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                if (e.target.value.length > 2) searchInventory(e.target.value);
                else setSearchResults([]);
              }}
            />
            {searchResults.length > 0 && (
              <div className="absolute top-16 left-4 right-4 bg-white border border-gray-200 shadow-xl rounded-lg z-20 max-h-64 overflow-y-auto">
                {showAlternativesFor && <div className="p-2 bg-blue-50 text-blue-700 font-bold text-xs sticky top-0">Alternatives for: {showAlternativesFor}</div>}
                {searchResults.map(item => (
                  <div key={item._id} className="p-3 hover:bg-gray-50 border-b border-gray-100 flex justify-between items-center cursor-pointer" onClick={() => addToCart(item)}>
                    <div>
                      <div className="font-bold text-gray-900">{item.brandName}</div>
                      <div className="text-xs text-gray-500">{item.genericName}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary-600">₹{item.unitPrice}</div>
                      <div className={`text-xs ${item.stockQuantity > 0 ? 'text-green-600' : 'text-red-500'}`}>Stock: {item.stockQuantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Table */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeRx && activeRx.medicines.map((m, i) => {
              // Check if this prescribed item is in the cart (basic name match for UI hint)
              const inCart = cart.some(c => c.brandName.toLowerCase().includes(m.name.toLowerCase()) || c.genericName.toLowerCase().includes(m.name.toLowerCase()));
              return (
                <div key={i} className={`p-3 mb-2 rounded-lg border flex justify-between items-center ${inCart ? 'bg-green-50 border-green-200 opacity-50' : 'bg-red-50 border-red-200'}`}>
                  <div>
                    <span className="font-bold text-gray-800">{m.name}</span>
                    <span className="text-xs text-gray-500 ml-2">({m.dosage} | {m.frequency} | {m.duration})</span>
                  </div>
                  {!inCart && (
                    <button onClick={() => searchInventory(m.name, true)} className="btn-secondary py-1 text-xs text-blue-600 border-blue-200 bg-white">
                      Find Alternatives
                    </button>
                  )}
                </div>
              )
            })}

            <div className="mt-6 font-bold text-gray-400 uppercase text-xs mb-2 tracking-widest border-b pb-1">Cart Items</div>
            {cart.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="text-left py-2">Item</th>
                    <th className="text-center py-2">Qty</th>
                    <th className="text-right py-2">Price</th>
                    <th className="text-right py-2">Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-50">
                      <td className="py-3">
                        <div className="font-bold text-gray-800">{item.brandName}</div>
                        <div className="text-xs text-gray-500">{item.genericName}</div>
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => updateCartQty(idx, item.quantity - 1)} className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 font-bold">-</button>
                          <span className="w-8 text-center font-bold">{item.quantity}</span>
                          <button onClick={() => updateCartQty(idx, item.quantity + 1)} className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 font-bold">+</button>
                        </div>
                      </td>
                      <td className="py-3 text-right">₹{item.unitPrice}</td>
                      <td className="py-3 text-right font-bold">₹{(item.unitPrice * item.quantity).toFixed(2)}</td>
                      <td className="py-3 text-right">
                        <button onClick={() => removeFromCart(idx)} className="text-red-400 hover:text-red-600">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center text-gray-400 mt-8 text-sm">Cart is empty. Scan barcode or search to add items.</div>
            )}
          </div>

          {/* Checkout Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center shrink-0">
            <div className="text-sm space-y-1">
              <div className="flex justify-between gap-8"><span className="text-gray-500">Subtotal:</span> <span className="font-bold">₹{subTotal.toFixed(2)}</span></div>
              <div className="flex justify-between gap-8"><span className="text-gray-500">Tax:</span> <span className="font-bold">₹{taxTotal.toFixed(2)}</span></div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-sm text-gray-500">Grand Total</div>
                <div className="text-3xl font-black text-gray-900">₹{grandTotal.toFixed(2)}</div>
              </div>
              <button 
                onClick={processSale}
                disabled={cart.length === 0}
                className="btn-primary px-8 py-4 text-lg disabled:opacity-50"
              >
                Checkout & Dispense
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* POS Receipt Modal (For Printing) */}
      {showPrint && invoice && (
        <div className="fixed inset-0 bg-gray-900/90 z-50 flex flex-col items-center justify-center p-8 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl flex flex-col w-[400px]">
            <div className="p-4 bg-gray-100 border-b flex justify-between items-center print:hidden rounded-t-xl">
              <h2 className="font-bold">Receipt Preview</h2>
              <div className="flex gap-2">
                <button onClick={handlePrint} className="btn-primary py-1">Print</button>
                <button onClick={() => setShowPrint(false)} className="btn-secondary py-1">Close</button>
              </div>
            </div>
            
            <div className="p-4 bg-gray-200 overflow-y-auto flex justify-center pb-8" style={{ maxHeight: '80vh' }}>
              <div ref={printRef} className="print-content shadow-lg">
                <PharmacyInvoicePrint invoice={invoice} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
