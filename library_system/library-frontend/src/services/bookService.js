// src/services/bookService.js
import API from "../api";

// Function to borrow a book
export const borrowBook = (bookId) => {
  return API.post(`/books/${bookId}/borrow/`);
};

// Function to reserve a book
export const reserveBook = (bookId) => {
  return API.post(`/books/${bookId}/reserve/`);
};

// Function to return a borrowed book
export const returnBook = (borrowedBookId) => {
  return API.post(`/books/${borrowedBookId}/return/`);
};
