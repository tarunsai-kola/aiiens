import { useState, useEffect } from 'react';
import { pharmacyApi } from '../../../api/pharmacy.api';
import toast from 'react-hot-toast';

export default function PharmacyInventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [newItem, setNewItem] = useState({
    brandName: '', genericName: '', manufacturer: '', barcode: '',
    batchNumber: '', expiryDate: '', stockQuantity: '', unitPrice: '', taxPercentage: '0', reorderLevel: '10'
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const { data } = await pharmacyApi.getInventory();
      setInventory(data.data || []);
    } catch (err) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await pharmacyApi.addInventory({
        ...newItem,
        stockQuantity: Number(newItem.stockQuantity),
        unitPrice: Number(newItem.unitPrice),
        taxPercentage: Number(newItem.taxPercentage),
        reorderLevel: Number(newItem.reorderLevel),
      });
      toast.success('Inventory item added');
      setShowAddModal(false);
      fetchInventory();
      // Reset
      setNewItem({
        brandName: '', genericName: '', manufacturer: '', barcode: '',
        batchNumber: '', expiryDate: '', stockQuantity: '', unitPrice: '', taxPercentage: '0', reorderLevel: '10'
      });
    } catch (err) {
      toast.error('Failed to add item');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Inventory...</div>;

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pharmacy Inventory</h1>
          <p className="text-gray-500">Stock Management & Master List</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          + Add New Item
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="p-4">Brand / Generic Name</th>
              <th className="p-4">Barcode</th>
              <th className="p-4">Batch & Expiry</th>
              <th className="p-4">Price (Tax)</th>
              <th className="p-4 text-center">Stock</th>
              <th className="p-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => {
              const isLow = item.stockQuantity <= item.reorderLevel;
              const isExpired = new Date(item.expiryDate) < new Date();
              
              return (
                <tr key={item._id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{item.brandName}</div>
                    <div className="text-xs text-gray-500">{item.genericName}</div>
                  </td>
                  <td className="p-4 font-mono text-gray-500">{item.barcode || 'N/A'}</td>
                  <td className="p-4">
                    <div>{item.batchNumber}</div>
                    <div className={`text-xs ${isExpired ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                      {new Date(item.expiryDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold">₹{item.unitPrice.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">Tax: {item.taxPercentage}%</div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-bold text-lg">{item.stockQuantity}</span>
                  </td>
                  <td className="p-4 text-center">
                    {isExpired ? (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Expired</span>
                    ) : isLow ? (
                      <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">Low Stock</span>
                    ) : (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">In Stock</span>
                    )}
                  </td>
                </tr>
              )
            })}
            {inventory.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-400">Inventory is empty</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-[600px] overflow-hidden flex flex-col max-h-full">
            <div className="p-4 border-b flex justify-between items-center font-bold">
              <h2>Add Inventory Item</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <form onSubmit={handleAddItem} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Brand Name *</label>
                  <input required type="text" className="input" value={newItem.brandName} onChange={e => setNewItem({...newItem, brandName: e.target.value})} />
                </div>
                <div>
                  <label className="label">Generic Name *</label>
                  <input required type="text" className="input" value={newItem.genericName} onChange={e => setNewItem({...newItem, genericName: e.target.value})} />
                </div>
                <div>
                  <label className="label">Manufacturer</label>
                  <input type="text" className="input" value={newItem.manufacturer} onChange={e => setNewItem({...newItem, manufacturer: e.target.value})} />
                </div>
                <div>
                  <label className="label">Barcode</label>
                  <input type="text" className="input font-mono" value={newItem.barcode} onChange={e => setNewItem({...newItem, barcode: e.target.value})} />
                </div>
                <div>
                  <label className="label">Batch Number</label>
                  <input type="text" className="input" value={newItem.batchNumber} onChange={e => setNewItem({...newItem, batchNumber: e.target.value})} />
                </div>
                <div>
                  <label className="label">Expiry Date *</label>
                  <input required type="date" className="input" value={newItem.expiryDate} onChange={e => setNewItem({...newItem, expiryDate: e.target.value})} />
                </div>
                <div>
                  <label className="label">Initial Stock *</label>
                  <input required type="number" min="0" className="input" value={newItem.stockQuantity} onChange={e => setNewItem({...newItem, stockQuantity: e.target.value})} />
                </div>
                <div>
                  <label className="label">Reorder Level</label>
                  <input type="number" min="0" className="input" value={newItem.reorderLevel} onChange={e => setNewItem({...newItem, reorderLevel: e.target.value})} />
                </div>
                <div>
                  <label className="label">Unit Price (₹) *</label>
                  <input required type="number" step="0.01" min="0" className="input" value={newItem.unitPrice} onChange={e => setNewItem({...newItem, unitPrice: e.target.value})} />
                </div>
                <div>
                  <label className="label">Tax Percentage (%)</label>
                  <input type="number" min="0" max="100" className="input" value={newItem.taxPercentage} onChange={e => setNewItem({...newItem, taxPercentage: e.target.value})} />
                </div>
              </div>
              <div className="pt-4 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
