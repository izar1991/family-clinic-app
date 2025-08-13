import React, { useEffect, useState } from "react";

export default function Accountability() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ staff_name: "", duty: "", date: "" });

  useEffect(() => {
    fetch("http://localhost:8000/accountability/")
      .then(res => res.json())
      .then(setEntries);
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    fetch("http://localhost:8000/accountability/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        staff_name: form.staff_name,
        duty: form.duty,
        date_: form.date
      })
    })
      .then(res => res.json())
      .then(entry => setEntries([...entries, entry]));
  };

  return (
    <div>
      <h2>Accountability</h2>
      <form onSubmit={handleSubmit}>
        <input name="staff_name" placeholder="Staff Name" value={form.staff_name} onChange={handleChange} />
        <input name="duty" placeholder="Duty" value={form.duty} onChange={handleChange} />
        <input name="date" placeholder="Date" type="date" value={form.date} onChange={handleChange} />
        <button type="submit">Add Entry</button>
      </form>
      <ul>
        {entries.map(entry => (
          <li key={entry.id}>{entry.staff_name} - {entry.duty} on {entry.date}</li>
        ))}
      </ul>
    </div>
  );
}