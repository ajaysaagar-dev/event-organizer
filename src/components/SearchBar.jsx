import { useState } from "react";
import "./css/SearchBar.css";

export default function SearchBar({ data = [], onResult }) {
  const [query, setQuery] = useState("");

  function handleChange(e) {
    const value = e.target.value;
    setQuery(value);

    const filtered = data.filter((item) =>
      item.toLowerCase().includes(value.toLowerCase())
    );

    onResult(filtered);
  }

  return (
    <div>
      <input
        value={query}
        onChange={handleChange}
        placeholder="Search"
      />
    </div>
  );
}
