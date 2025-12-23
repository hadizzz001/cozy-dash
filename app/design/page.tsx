'use client';

import { useState, useEffect } from 'react';
import Upload from '../components/Upload';
import { useRouter } from 'next/navigation';

const ManageCategory = () => {
  const router = useRouter();

  // ================= STATES =================
  const [formData, setFormData] = useState({
    title: '',
    img: [],
    cat: [], // ✅ selected categories
  });

  const [editFormData, setEditFormData] = useState({
    id: '',
    title: '',
    img: [],
    cat: [],
  });

  const [categories, setCategories] = useState([]); // designs
  const [allCats, setAllCats] = useState([]); // categories from /api/category
  const [img, setImg] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState('');

  // ================= FETCH DESIGN =================
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/design');
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ================= FETCH CATEGORIES =================
  const fetchAllCats = async () => {
    try {
      const res = await fetch('/api/category');
      if (res.ok) {
        setAllCats(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchAllCats();
  }, []);

  // ================= IMAGE =================
  const handleImgChange = (url) => {
    if (url) setImg(url);
  };

  useEffect(() => {
    if (!img.length) return;

    editMode
      ? setEditFormData((prev) => ({ ...prev, img }))
      : setFormData((prev) => ({ ...prev, img }));
  }, [img]);

  // ================= TOGGLE CATEGORY =================
  const toggleCat = (value) => {
    if (editMode) {
      setEditFormData((prev) => ({
        ...prev,
        cat: prev.cat.includes(value)
          ? prev.cat.filter((c) => c !== value)
          : [...prev.cat, value],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        cat: prev.cat.includes(value)
          ? prev.cat.filter((c) => c !== value)
          : [...prev.cat, value],
      }));
    }
  };

  // ================= ADD =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/design', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setMessage('Design added successfully!');
      setFormData({ title: '', img: [], cat: [] });
      setImg([]);
      fetchCategories();
      router.refresh();
    }
  };

  // ================= EDIT =================
  const handleEdit = (item) => {
    setEditMode(true);
    setEditFormData({
      id: item.id,
      title: item.title,
      img: item.img || [],
      cat: item.cat || [],
    });
    setImg(item.img || []);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(
      `/api/design?id=${encodeURIComponent(editFormData.id)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editFormData.title,
          img: editFormData.img,
          cat: editFormData.cat,
        }),
      }
    );

    if (res.ok) {
      setEditMode(false);
      setEditFormData({ id: '', title: '', img: [], cat: [] });
      setImg([]);
      fetchCategories();
      router.refresh();
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;

    const res = await fetch(`/api/design?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setMessage('Design deleted successfully!');
      fetchCategories();
      router.refresh();
    }
  };

  // ================= UI =================
  return (
    <div className="container mx-auto p-4 text-[13px]">
      <h1 className="text-2xl font-bold mb-4">
        {editMode ? 'Edit Design' : 'Add Design'}
      </h1>

      {/* ================= FORM ================= */}
      <form
        onSubmit={editMode ? handleEditSubmit : handleSubmit}
        className="space-y-4 mb-8"
      >
        {/* TITLE */}
        <input
          type="text"
          placeholder="Design Title"
          value={editMode ? editFormData.title : formData.title}
          onChange={(e) =>
            editMode
              ? setEditFormData({ ...editFormData, title: e.target.value })
              : setFormData({ ...formData, title: e.target.value })
          }
          required
          className="border p-2 w-full"
        />

        {/* CATEGORY TAGS */}
        <div className="flex flex-wrap gap-2">
          {allCats.map((c) => {
            const selected = editMode
              ? editFormData.cat.includes(c.name)
              : formData.cat.includes(c.name);

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCat(c.name)}
                className={`px-3 py-1 rounded border text-sm transition
                  ${
                    selected
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-gray-300 hover:border-black'
                  }
                `}
              >
                {c.name}
              </button>
            );
          })}
        </div>

        {/* IMAGE UPLOAD */}
        <Upload onFilesUpload={handleImgChange} />

        {/* BUTTONS */}
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {editMode ? 'Update Design' : 'Add Design'}
        </button>

        {editMode && (
          <button
            type="button"
            onClick={() => {
              setEditMode(false);
              setEditFormData({ id: '', title: '', img: [], cat: [] });
              setImg([]);
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded ml-2"
          >
            Cancel
          </button>
        )}
      </form>

      {/* ================= TABLE ================= */}
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Image</th>
            <th className="border p-2">Title</th>
            <th className="border p-2">Categories</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((item) => (
            <tr key={item.id}>
              <td className="border p-2">
                {item.img?.length ? (
                  <img
                    src={item.img[0]}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  '—'
                )}
              </td>

              <td className="border p-2">{item.title}</td>

              <td className="border p-2">
                {item.cat?.length ? item.cat.join(', ') : '—'}
              </td>

              <td className="border p-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
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
