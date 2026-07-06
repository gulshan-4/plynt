import React from "react";

export function Note({ label='Note', text }) {
  return (
    <div className="border-l-4 border-gray-300 bg-gray-50 p-4 my-6 text-gray-800 rounded-md">
      <p>
        <strong> {label}:</strong> {text}
      </p>
    </div>
  );
}

export function Tip({ label='💡Tip', text }) {
  return (
    <div className="border-l-4 border-green-400 bg-green-50 p-4 my-6 text-green-800 rounded-md">
      <p>
        <strong>{label}:</strong> {text}
      </p>
    </div>
  );
}

export function Warning({ label='⚠️ Warning', text }) {
  return (
    <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 my-6 text-yellow-800 rounded-md">
      <p>
        <strong>{label}:</strong> {text}
      </p>
    </div>
  );
}

export function Info({label='ℹ️ Info', text }) {
  return (
    <div className="border-l-4 border-blue-400 bg-blue-50 p-4 my-6 text-blue-800 rounded-md">
      <p>
        <strong>{label}:</strong> {text}
      </p>
    </div>
  );
}
