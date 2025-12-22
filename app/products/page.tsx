"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import Upload from "../components/Upload";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function AddProduct() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [img, setImg] = useState([""]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subcategoryOptions, setSubCategoryOptions] = useState([]);
  const [selectedsubCategory, setSelectedsubCategory] = useState("");
  const [factoryOptions, setFactoryOptions] = useState([]);
  const [selectedFactory, setSelectedFactory] = useState("");
  const [productType, setProductType] = useState("single");
  const [discount, setDiscount] = useState("");
  const [colorOptions, setColorOptions] = useState([]);
const [sizeOptions, setSizeOptions] = useState([]);
const [colorSizeData, setColorSizeData] = useState({});


  // NEW STATES 
  const [selectedColors, setSelectedColors] = useState([]);
  const [colorQuantities, setColorQuantities] = useState({}); 
  const [selectedSizes, setSelectedSizes] = useState([]);


  // Fetch colors
useEffect(() => {
  async function fetchColors() {
    const res = await fetch('/api/color');
    const data = await res.json();
    setColorOptions(data);
  }
  fetchColors();
}, []);

// Fetch sizes
useEffect(() => {
  async function fetchSizes() {
    const res = await fetch('/api/size');
    const data = await res.json();
    setSizeOptions(data);
  }
  fetchSizes();
}, []);


 

const handleColorToggle = (colorId) => {
  setSelectedColors((prev) =>
    prev.includes(colorId)
      ? prev.filter((id) => id !== colorId)
      : [...prev, colorId]
  );

  // Initialize rows if not existing
  setColorSizeData((prev) => ({
    ...prev,
    [colorId]: prev[colorId] || sizeOptions.map((s) => ({
      size: s.title,
      qty: "",
      price: ""
    }))
  }));
};

  /** Fetch categories / sub / factory */
  useEffect(() => {
    fetchList("/api/category", setCategoryOptions);
    fetchList("/api/sub", setSubCategoryOptions);
    fetchList("/api/factory", setFactoryOptions);
  }, []);

  const fetchList = async (url, setter) => {
    const res = await fetch(url);
    if (res.ok) setter(await res.json());
  };

  /** ✅ Submit product */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (img.length === 1 && img[0] === "") {
      return alert("Please choose at least 1 image");
    }

    if (productType === "collection") {
      if (selectedColors.length === 0) {
        return alert("Choose at least 1 color and quantity");
      }
    }

    const payload = {
      title,
      description,
      price: Number(price).toFixed(2),
      discount: discount
  ? (Number(price) - (Number(price) * Number(discount) / 100)).toFixed(2)
  : null,
      img,
      category: selectedCategory,
      sub: selectedsubCategory,
      factory: selectedFactory,
      type: productType,

      ...(productType === "single" && { stock }),

...(productType === "collection" && {
  color: selectedColors.map((colorId) => {
    const colorObj = colorOptions.find((c) => c.id === colorId);
    return {
      id: colorObj.id,
      title: colorObj.title,
      code: colorObj.code,
      sizes: colorSizeData[colorId]
        .filter((s) => s.qty > 0) // ignore empty
        .map((s) => ({
          size: s.size,
          qty: Number(s.qty),
          price: Number(s.price),
        })),
    };
  }),
}),



    };

    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) return alert("Failed to add product");

    alert("Product added successfully!");
    window.location.href = "/dashboard";
  };

  const handleImgChange = (url) => {
    if (url) setImg(url);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Add New Product</h1>

      {/* TITLE */}
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border p-2 mb-4"
        required
      />

      {/* CATEGORY */}
      <label className="font-bold">Category</label>
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="w-full border p-2 mb-4"
        required
      >
        <option value="">Select Category</option>
        {categoryOptions.map((i) => (
          <option key={i.id} value={i.name}>
            {i.name}
          </option>
        ))}
      </select>

      {/* SUB CATEGORY */}
      <label className="font-bold">Sub-Category</label>
      <select
        value={selectedsubCategory}
        onChange={(e) => setSelectedsubCategory(e.target.value)}
        className="w-full border p-2 mb-4"
        required
      >
        <option value="">Select Sub</option>
        {subcategoryOptions.map((i) => (
          <option key={i.id} value={i.name}>
            {i.name}
          </option>
        ))}
      </select>

      {/* FACTORY */}
      <label className="font-bold">Brand</label>
      <select
        value={selectedFactory}
        onChange={(e) => setSelectedFactory(e.target.value)}
        className="w-full border p-2 mb-4"
        required
      >
        <option value="">Select Brand</option>
        {factoryOptions.map((i) => (
          <option key={i.id} value={i.name}>
            {i.name}
          </option>
        ))}
      </select>

      {/* PRODUCT TYPE */}
      <div className="mb-4">
        <label className="font-bold">Product Type</label>
        <div className="flex gap-4">
          <label><input type="radio" value="single" checked={productType === "single"} onChange={() => setProductType("single")}/> 1 Item</label>
          <label><input type="radio" value="collection" checked={productType === "collection"} onChange={() => setProductType("collection")}/> Collection</label>
        </div>
      </div>

 

{productType === "single" && (
  <>
    <input
      type="number"
      step="0.01"
      placeholder="Price"
      value={price}
      onChange={(e) => setPrice(e.target.value)}
      className="w-full border p-2 mb-4"
    />

    <input
      type="number"
      step="0.01"
      placeholder="Discount %"
      value={discount}
      onChange={(e) => setDiscount(e.target.value)}
      className="w-full border p-2 mb-4"
    />

    {/* ✅ STOCK FIELD */}
    <input
      type="number"
      placeholder="Stock Quantity"
      value={stock}
      onChange={(e) => setStock(e.target.value)}
      className="w-full border p-2 mb-4"
      required
    />
  </>
)}



{productType === "collection" && (
  <div className="mb-6">
    <label className="font-bold block mb-3 text-lg">Select Colors</label>

    {/* COLOR PICKER */}
    <div className="flex flex-wrap gap-4 mb-6">
      {colorOptions.map((color) => (
        <div
          key={color.id}
          className={`cursor-pointer border p-2 rounded-md text-center w-24 ${
            selectedColors.includes(color.id) ? "ring-2 ring-green-500" : ""
          }`}
          onClick={() => handleColorToggle(color.id)}
        >
          <div
            className="w-7 h-7 rounded-full mx-auto border mb-1"
            style={{ backgroundColor: color.code }}
          ></div>
          <span className="text-sm">{color.title}</span>
        </div>
      ))}
    </div>

    {/* COLOR → SIZE → QTY + PRICE */}
    {selectedColors.map((colorId) => {
      const colorData = colorOptions.find((c) => c.id === colorId);

      return (
        <div key={colorId} className="border rounded-lg p-4 mb-6 bg-gray-50">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-full border"
              style={{ backgroundColor: colorData.code }}
            ></div>
            {colorData.title}
          </h2>

          <div className="space-y-3">
            {colorSizeData[colorId]?.map((item, index) => (
              <div key={index} className="grid grid-cols-3 gap-3">
                <div>{item.size}</div>

                <input
                  type="number"
                  placeholder="Qty"
                  className="border p-1"
                  value={item.qty}
                  onChange={(e) => {
                    const newData = [...colorSizeData[colorId]];
                    newData[index].qty = e.target.value;
                    setColorSizeData((prev) => ({ ...prev, [colorId]: newData }));
                  }}
                />

                <input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  className="border p-1"
                  value={item.price}
                  onChange={(e) => {
                    const newData = [...colorSizeData[colorId]];
                    newData[index].price = e.target.value;
                    setColorSizeData((prev) => ({ ...prev, [colorId]: newData }));
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      );
    })}
  </div>
)}



      <label className="font-bold">Description</label>
      <ReactQuill value={description} onChange={setDescription} className="mb-6" />

      <Upload onFilesUpload={handleImgChange} /> Max 12 images

      <button type="submit" className="bg-green-500 text-white px-4 py-2 mt-4 w-full">
        Save Product
      </button>
    </form>
  );
}
