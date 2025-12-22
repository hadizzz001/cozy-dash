'use client';

import { useState, useEffect } from 'react'; 
import { useRouter } from 'next/navigation';

const ManageCategory = () => {
  const [formData, setFormData] = useState({ title: '' });
  const [editFormData, setEditFormData] = useState({ id: '', title: '' });
  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const router = useRouter();

  // ✅ Fetch all subcategories
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/size', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      } else {
        console.error('Failed to fetch subcategories');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ✅ Add size
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/size', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setMessage('size added successfully!');
      setFormData({ title: '' });
      fetchCategories();
      router.refresh();
    } else {
      const errorData = await res.json();
      setMessage(`Error: ${errorData.error}`);
    }
  };

  // ✅ Edit size
  const handleEdit = (category) => {
    setEditMode(true);
    setEditFormData({
      id: category.id,
      title: category.title,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/size?id=${encodeURIComponent(editFormData.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editFormData.title,
        }),
      });

      if (res.ok) {
        setEditFormData({ id: '', title: '' });
        setEditMode(false);
        fetchCategories();
        router.refresh();
      } else {
        const errorData = await res.json();
        setMessage(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred while updating the size.');
    }
  };

  // ✅ Delete size
  const handleDelete = async (id) => {
    if (confirm(`Are you sure you want to delete this size?`)) {
      try {
        const res = await fetch(`/api/size?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setMessage('size deleted successfully!');
          fetchCategories();
          router.refresh();
        } else {
          const errorData = await res.json();
          setMessage(`Error: ${errorData.error}`);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

 
 


  return (
    <div className="container mx-auto p-4 text-[13px]">
      <h1 className="text-2xl font-bold mb-4">{editMode ? 'Edit size' : 'Add size'}</h1>

      {/* ✅ ADD / EDIT FORM */}
      <form onSubmit={editMode ? handleEditSubmit : handleSubmit} className="mb-8 space-y-4">
        <input
          type="text"
          placeholder="size Name"
          value={editMode ? editFormData.title : formData.title}
          onChange={(e) =>
            editMode
              ? setEditFormData({ ...editFormData, title: e.target.value })
              : setFormData({ ...formData, title: e.target.value })
          }
          required
          className="border p-2 w-full"
        />


        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          {editMode ? 'Update size' : 'Add size'}
        </button>
        {editMode && (
          <button
            type="button"
            onClick={() => {
              setEditMode(false);
              setEditFormData({ id: '', title: '' });
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded ml-2"
          >
            Cancel
          </button>
        )}
      </form>

 

      {/* ✅ size TABLE */}
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">Name</th> 
            <th className="border p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
 
              <td className="border p-2">{category.title}</td>

 

              <td className="border p-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
};

export default ManageCategory;
