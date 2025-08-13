import React, { useEffect, useState } from "react";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ description: "", amount: "", date: "" });

  useEffect(() => {
    fetch("http://localhost:8000/expenses/")
      .then(res => res.json())
      .then(setExpenses);
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    fetch("http://localhost:8000/expenses/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: form.description,
        amount: parseFloat(form.amount),
        date_: form.date
      })
    })
      .then(res => res.json())
      .then(exp => setExpenses([...expenses, exp]));
  };

  return (
    <div>
      <h2>Expenses</h2>
      <form onSubmit={handleSubmit}>
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <input name="amount" placeholder="Amount" type="number" value={form.amount} onChange={handleChange} />
        <input name="date" placeholder="Date" type="date" value={form.date} onChange={handleChange} />
        <button type="submit">Add Expense</button>
      </form>
      <ul>
        {expenses.map(exp => (
          <li key={exp.id}>{exp.description}: ${exp.amount} on {exp.date}</li>
        ))}
      </ul>
    </div>
  );
}