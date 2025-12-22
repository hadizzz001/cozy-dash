'use client';

import { useState, useEffect } from 'react';
import Upload from '../components/Upload';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import ExportToExcel from '../components/ExportToExcel';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function ProductTable() {
  const [products, setProducts] = useState([]);
  const [products1, setProducts1] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');


  // Fetch products and categories on load
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);



  const fetchProducts = async () => {
    const response = await fetch('/api/products');
    if (response.ok) {
      const data = await response.json();
      setProducts(data);
    } else {
      console.error('Failed to fetch products');
    }
  };

  const fetchCategories = async () => {
    const response = await fetch('/api/category');
    if (response.ok) {
      const data = await response.json();
      setCategories(data);
    } else {
      console.error('Failed to fetch categories');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Product deleted successfully');
          fetchProducts();
        } else {
          console.error('Failed to delete product');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleUpdate = async (updatedProduct) => {
    try {
      const response = await fetch(`/api/products/${updatedProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });

      if (response.ok) {
        alert('Product updated successfully');
        setEditingProduct(null);
        fetchProducts();
      } else {
        console.error('Failed to update product');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Filter products by search query
  const filterBySearch = (product) => {
    return product.title.toLowerCase().includes(searchQuery.toLowerCase());
  };

  // Filter products by selected category
  const filterByCategory = (product) => {
    const isFilteredByCategory = selectedCategory ? product.category === selectedCategory : true;

    return isFilteredByCategory;
  };

  // Apply both search and category filters
  const filteredProducts = products.filter((product) => {
    return filterBySearch(product) && filterByCategory(product);
  });



 




  return (
    <div className="max-w-7xl mx-auto p-4 text-[12px]">
      {editingProduct && (
        <EditProductForm
          product={editingProduct}
          onCancel={() => setEditingProduct(null)}
          onSave={handleUpdate}
        />
      )}
      <h1 className="text-2xl font-bold mb-4">Product List</h1>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border p-2"
          placeholder="Search by title..."
        />
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full border p-2"
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <ExportToExcel products={products} />

 



      <table className="table-auto w-full border-collapse border border-gray-200 mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Title</th>
            {/* <th className="border p-2">Pic</th> */}
            <th className="border p-2">Price (USD)</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Stock</th>
            <th className="border p-2">Colors & Qty</th> 
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredProducts.map((product) => {
            const fileUrl = product.img[0];
            const isVideo = /\.(mp4|webm|ogg)$/i.test(fileUrl);
            const isCollection = product.type === "collection";
            const isSingle = product.type === "single";

            // Stock Calculation Logic
            const isOutOfStockSingle = isSingle && (product.stock === "0" || product.stock === 0 || product.stock === null);

            const allColorsQtyZero = isCollection &&
              product.color &&
              product.color.length > 0 &&
              product.color.every(c => !c.sizes && parseInt(c.qty) === 0);

            const allSizesQtyZero = isCollection &&
              product.color &&
              product.color.length > 0 &&
              product.color.every(c =>
                Array.isArray(c.sizes) &&
                c.sizes.length > 0 &&
                c.sizes.every(s => parseInt(s.qty || 0) === 0)
              );

            let totalStock = 0;
            if (isSingle) {
              totalStock = parseInt(product.stock || 0);
            } else if (product.color && product.color.length > 0) {
              product.color.forEach(c => {
                if (Array.isArray(c.sizes) && c.sizes.length > 0) {
                  totalStock += c.sizes.reduce((sum, s) => sum + parseInt(s.qty || 0), 0);
                } else {
                  totalStock += parseInt(c.qty || 0);
                }
              });
            }

            const isLowStock = totalStock > 0 && totalStock < 3;

            let rowClass = "";
            if (isOutOfStockSingle || allColorsQtyZero || allSizesQtyZero) {
              rowClass = "bg-red-300";
            } else if (isLowStock) {
              rowClass = "bg-yellow-300";
            }





            return (
              <tr key={product.id} className={rowClass}>

                <td className="border p-2">{product.title}</td>
                {/* <td className="border p-2">
                  {isVideo ? (
                    <video controls className="w-24 h-auto">
                      <source src={fileUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img src={fileUrl} alt="Product" className="w-24 h-auto" />
                  )}
                </td> */}
<td className="border p-2">
  {product.discount && product.discount > 0 ? (
    <span>
      <span className="line-through text-red-600 mr-1">${product.price}</span>
      <span className="font-bold text-green-600">${product.discount}</span>
    </span>
  ) : (
    `$${product.price}`
  )}
</td>



                <td className="border p-2">{product.category}</td>
                <td className="border p-2">{product.type}</td>

                <td className="border p-2">
                  {product.type === 'single' && product.stock}

                  {product.type === 'collection' && product.color && !product.color[0]?.sizes &&
                    product.color.reduce((sum, c) => sum + (c.qty || 0), 0)
                  }

                  {product.type === 'collection' && product.color && product.color[0]?.sizes &&
                    product.color.reduce(
                      (colorSum, color) =>
                        colorSum +
                        (color.sizes
                          ? color.sizes.reduce((sizeSum, s) => sizeSum + (s.qty || 0), 0)
                          : 0),
                      0
                    )
                  }
                </td>

                <td className="border p-2">
                  {!isSingle && product.color && product.color.length > 0 ? (
                    <ul className="space-y-1">
                      {product.color.map((c, index) => (
                        <li key={index}>
                          <span className="font-semibold">{c.color}</span>
                          {c.sizes && Array.isArray(c.sizes) ? (
                            <ul className="ml-4 space-y-1 list-disc">
                              {c.sizes.map((s, idx) => (
                                <li key={idx}>
                                  <span className="italic">{s.size}</span>: {s.qty}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <>: {c.qty}</>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    isCollection ? 'No colors' : '—'
                  )}
                </td>

 




                <td className="border p-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="bg-yellow-500 text-white px-2 py-1 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-500 text-white px-2 py-1"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>

      </table>


    </div>
  );
}




 
 
 function EditProductForm({ product, onCancel, onSave }) {
const [title, setTitle] = useState(product?.title || "");
const [description, setDescription] = useState(product?.description || "");
const [price, setPrice] = useState(product?.price || 0);
const [discount, setDiscount] = useState(product?.discount || 0);
const [type, setType] = useState(product?.type || "single");
const [stock, setStock] = useState(product?.stock || "");
const [img, setImg] = useState(product?.img || []);

const [selectedCategory, setSelectedCategory] = useState(product?.category || "");
const [selectedSub, setSelectedSub] = useState(product?.sub || "");
const [selectedFactory, setSelectedFactory] = useState(product?.factory || "");


  const [categories, setCategories] = useState([]);

  const [subCategories, setSubCategories] = useState([]);

  const [factories, setFactories] = useState([]);

  // ✅ NEW (fetch from API)
  const [colorOptions, setColorOptions] = useState([]);
  const [sizeOptions, setSizeOptions] = useState([]);

  // ✅ NEW DATA STRUCTURE: { colorId: [ { size, qty, price } ] }
  const [colorSizeData, setColorSizeData] = useState({});

  /** ✅ Fetch Colors & Sizes */
  useEffect(() => {
    async function loadColors() {
      const res = await fetch("/api/color");
      setColorOptions(await res.json());
    }
    async function loadSizes() {
      const res = await fetch("/api/size");
      setSizeOptions(await res.json());
    }
    loadColors();
    loadSizes();
  }, []);

  /** ✅ Pre-fill existing product color/sizes */
  useEffect(() => {
    if (product.color) {
      const prepared = {};

      product.color.forEach((c) => {
        prepared[c.id] = c.sizes.map((s) => ({
          size: s.size,
          qty: s.qty,
          price: s.price,
        }));
      });

      setColorSizeData(prepared);
    }
  }, [product]);

  /** ✅ Fetch Category / Sub / Factory */
  useEffect(() => {
    fetchList("/api/category", setCategories);
    fetchList("/api/sub", setSubCategories);
    fetchList("/api/factory", setFactories);
  }, []);

  const fetchList = async (url, setter) => {
    const res = await fetch(url);
    if (res.ok) setter(await res.json());
  };

  /** ✅ Select / remove color */
  const handleColorToggle = (colorId) => {
    setColorSizeData((prev) => {
      const updated = { ...prev };

      if (updated[colorId]) {
        delete updated[colorId];
      } else {
        updated[colorId] = sizeOptions.map((s) => ({
          size: s.title,
          qty: "",
          price: "",
        }));
      }
      return updated;
    });
  };

  /** ✅ Save */
const handleSubmit = (e) => {
  e.preventDefault();

  // ✅ calculate final price after discount
  const discountedPrice =
    discount
      ? (Number(price) - Number(price) * (Number(discount) / 100)).toFixed(2)
      : null;

  const payload = {
    ...product,

    title,
    description,

    // ORIGINAL PRICE
    price: String(price),

    // FINAL PRICE AFTER DISCOUNT (80 if discount=20% on price=100)
    discount: discountedPrice,

    img,
    category: selectedCategory,
    sub: selectedSub,
    factory: selectedFactory,
    type,

    ...(type === "single" && { stock }),

    ...(type === "collection" && {
      color: Object.entries(colorSizeData).map(([colorId, sizes]) => {
        const colorObj = colorOptions.find((c) => c.id === colorId);

        return {
          id: colorObj.id,
          title: colorObj.title,
          code: colorObj.code,
          sizes: sizes
            .filter((s) => s.qty > 0)
            .map((s) => ({
              size: s.size,
              qty: Number(s.qty),
              price: Number(s.price),
            })),
        };
      }),
    }),
  };

  onSave(payload);
};


  return (
    <form onSubmit={handleSubmit} className="border p-4 bg-gray-100 rounded text-[12px]">
      <h2 className="text-xl font-bold mb-4">Edit Product</h2>

      <input className="border p-2 w-full mb-3" value={title} onChange={(e) => setTitle(e.target.value)} />

      {/* CATEGORY */}
      <select className="border p-2 w-full mb-2" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
        <option value="">Select Category</option>
        {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
      </select>

      <select className="border p-2 w-full mb-2" value={selectedSub} onChange={(e) => setSelectedSub(e.target.value)}>
        <option value="">Select Sub-Category</option>
        {subCategories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
      </select>

      <select className="border p-2 w-full mb-4" value={selectedFactory} onChange={(e) => setSelectedFactory(e.target.value)}>
        <option value="">Select Factory</option>
        {factories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
      </select>

      {/* TYPE */}
      <div className="flex gap-4 mb-4">
        <label><input type="radio" checked={type === "single"} onChange={() => setType("single")} /> Single</label>
        <label><input type="radio" checked={type === "collection"} onChange={() => setType("collection")} /> Collection</label>
      </div>

      {type === "single" && (
        <input type="number" placeholder="Stock" className="border p-2 w-full mb-4" value={stock} onChange={(e) => setStock(e.target.value)} />
      )}

      <input type="number" placeholder="Price" className="border p-2 w-full mb-2" value={price} onChange={(e) => setPrice(e.target.value)} />
      <input type="number" placeholder="Discount %" className="border p-2 w-full mb-4" value={discount} onChange={(e) => setDiscount(e.target.value)} />

      {/* ✅ COLORS + SIZES */}
      {type === "collection" && (
        <div className="mb-6">
          <label className="font-bold text-lg">Colors</label>

          <div className="flex flex-wrap gap-3 mt-3">
            {colorOptions.map((c) => (
              <div key={c.id} onClick={() => handleColorToggle(c.id)}
                   className={`p-2 cursor-pointer rounded-md border w-24 text-center ${
                     colorSizeData[c.id] ? "ring-2 ring-green-500" : ""
                   }`}
              >
                <div className="w-7 h-7 rounded-full mx-auto border mb-1" style={{ backgroundColor: c.code }}></div>
                {c.title}
              </div>
            ))}
          </div>

          {Object.keys(colorSizeData).map((colorId) => {
            const colorObj = colorOptions.find((c) => c.id === colorId);

            return (
              <div key={colorId} className="border p-4 bg-gray-50 rounded mt-4">
                <h3 className="font-bold flex items-center gap-2">
                 <div
  className="w-5 h-5 rounded-full"
  style={{ backgroundColor: colorObj?.code || '#ccc' }}
></div>

                {colorObj?.title || "Unknown Color"}

                </h3>

                {colorSizeData[colorId].map((item, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-2 my-2">
                    <span>{item.size}</span>

                    <input type="number" className="border p-1"
                           value={item.qty}
                           placeholder="Qty"
                           onChange={(e) => {
                             const updated = [...colorSizeData[colorId]];
                             updated[idx].qty = e.target.value;
                             setColorSizeData({ ...colorSizeData, [colorId]: updated });
                           }}
                    />

                    <input type="number" className="border p-1"
                           value={item.price}
                           placeholder="Price"
                           onChange={(e) => {
                             const updated = [...colorSizeData[colorId]];
                             updated[idx].price = e.target.value;
                             setColorSizeData({ ...colorSizeData, [colorId]: updated });
                           }}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      <label className="font-bold">Description</label>
      <ReactQuill value={description} onChange={setDescription} className="mb-4" />

      <Upload onFilesUpload={(url) => setImg(url)} />

      <button className="bg-green-500 w-full text-white py-2 rounded">Save Product</button>
      <button type="button" onClick={onCancel} className="bg-gray-500 text-white w-full py-2 rounded mt-2">
        Cancel
      </button>
    </form>
  );
}

 