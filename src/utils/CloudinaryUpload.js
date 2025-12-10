export async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "essayverifier"); 
  formData.append("cloud_name", "dvip0qmty");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/dvip0qmty/auto/upload",
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();
  return data.secure_url; // URL file
}
