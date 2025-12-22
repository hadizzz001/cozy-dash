'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ManageCategory = () => {
  const [formData, setFormData] = useState({ title: '', code: '#000000' });
  const [editFormData, setEditFormData] = useState({ id: '', title: '', code: '#000000' });
  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const router = useRouter();

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/color', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      } else {
        console.error('Failed to fetch colors');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ✅ Add color
  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/color', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData), // includes title + code
    });

    if (res.ok) {
      setMessage('Color added successfully!');
      setFormData({ title: '', code: '#000000' });
      fetchCategories();
      router.refresh();
    } else {
      const errorData = await res.json();
      setMessage(`Error: ${errorData.error}`);
    }
  };

  // ✅ Edit color
  const handleEdit = (category) => {
    setEditMode(true);
    setEditFormData({
      id: category.id,
      title: category.title,
      code: category.code,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/color?id=${encodeURIComponent(editFormData.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editFormData.title,
          code: editFormData.code,
        }),
      });

      if (res.ok) {
        setEditFormData({ id: '', title: '', code: '#000000' });
        setEditMode(false);
        fetchCategories();
        router.refresh();
      } else {
        const errorData = await res.json();
        setMessage(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred while updating the color.');
    }
  };

  // ✅ Delete color
  const handleDelete = async (id) => {
    if (confirm(`Are you sure you want to delete this color?`)) {
      try {
        const res = await fetch(`/api/color?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          setMessage('Color deleted successfully!');
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
      <h1 className="text-2xl font-bold mb-4">{editMode ? 'Edit Color' : 'Add Color'}</h1>

      {/* ✅ Add / Edit Form */}
      <form onSubmit={editMode ? handleEditSubmit : handleSubmit} className="mb-8 space-y-4">
        <input
          type="text"
          placeholder="Color Title"
          value={editMode ? editFormData.title : formData.title}
          onChange={(e) =>
            editMode
              ? setEditFormData({ ...editFormData, title: e.target.value })
              : setFormData({ ...formData, title: e.target.value })
          }
          required
          className="border p-2 w-full"
        />

        {/* ✅ Color Picker */}
        <input
          type="color"
          value={editMode ? editFormData.code : formData.code}
          onChange={(e) =>
            editMode
              ? setEditFormData({ ...editFormData, code: e.target.value })
              : setFormData({ ...formData, code: e.target.value })
          }
          className="border p-2 w-16 h-10 cursor-pointer"
        />

        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          {editMode ? 'Update Color' : 'Add Color'}
        </button>

        {editMode && (
          <button
            type="button"
            onClick={() => {
              setEditMode(false);
              setEditFormData({ id: '', title: '', code: '#000000' });
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded ml-2"
          >
            Cancel
          </button>
        )}
      </form>

      {/* ✅ Table */}
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">Title</th>
            <th className="border p-2 text-left">Color</th>
            <th className="border p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td className="border p-2">{category.title}</td>

              <td className="border p-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded border" style={{ backgroundColor: category.code }}></div>
                <span>{category.code}</span>
              </td>

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
