import React, { useState, useEffect } from "react";

const BookForm = ({ initialData = {}, onSubmit }) => {
  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    quantity: 1,
    cover_image: null,
    ...initialData,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="border p-3 rounded mb-4">
      <input
        type="text"
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Title"
        className="form-control mb-2"
        required
      />
      <input
        type="text"
        name="author"
        value={form.author}
        onChange={handleChange}
        placeholder="Author"
        className="form-control mb-2"
        required
      />
      <input
        type="text"
        name="isbn"
        value={form.isbn}
        onChange={handleChange}
        placeholder="ISBN"
        className="form-control mb-2"
        required
      />
      <input
        type="number"
        name="quantity"
        value={form.quantity}
        onChange={handleChange}
        placeholder="Quantity"
        className="form-control mb-2"
        min="1"
        required
      />
      <input
        type="file"
        name="cover_image"
        onChange={handleChange}
        className="form-control mb-2"
        accept="image/*"
      />
      <button type="submit" className="btn btn-primary">
        Save
      </button>
    </form>
  );
};

export default BookForm;
