import { useState } from "react";
import SearchBar from "./components/searchbar";

const users = ["Alice", "Brian", "Ntombenhle", "Sibusiso"];

export default function Example() {
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <SearchBar value={search} onChange={setSearch} />

      <ul>
        {filteredUsers.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </>
  );
}
