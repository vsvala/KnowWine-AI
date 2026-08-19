const getLocation = async (lon, lat) => {
  const response = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}&lang=en`);
  if (!response.ok) {
    throw new Error(`Photon reverse geocoding failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

module.exports = { getLocation };
