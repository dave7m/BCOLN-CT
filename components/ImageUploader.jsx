import { useState } from "react";

export default function ImageUploader({ onUploaded }) {
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;

      const res = await fetch("/api/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64,
          filename: file.name,
        }),
      });

      const data = await res.json();
      if (data?.url) {
        onUploaded(data.url);
      } else {
        alert("Upload failed");
      }

      setLoading(false);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="flex justify-center">
      <label
        className="cursor-pointer inline-block px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-md shadow-md transition"
      >
        {loading ? "Uploading..." : "📁 Choose Image"}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={loading}
          className="hidden"
        />
      </label>
    </div>
  );
}
