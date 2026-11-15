const map = L.map("map").setView([26.0023, 63.0505], 12);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

const status = document.getElementById("status");

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function markerColor(type) {
  return type === "Book Shop" ? "#b35b24" : "#286a9b";
}

async function loadFacilities() {
  try {
    const response = await fetch("/api/facilities");

    if (!response.ok) {
      throw new Error("Could not load facility data.");
    }

    const data = await response.json();
    const layer = L.geoJSON(data, {
      pointToLayer: (feature, latlng) => {
        const color = markerColor(feature.properties.facility_type);
        return L.circleMarker(latlng, {
          radius: 8,
          color,
          fillColor: color,
          fillOpacity: 0.8
        });
      },
      onEachFeature: (feature, marker) => {
        const place = feature.properties;
        const sourceLink = place.source_url?.startsWith("https://")
          ? `<a href="${escapeHtml(place.source_url)}" target="_blank" rel="noopener noreferrer">Open source</a>`
          : "";

        marker.bindPopup(`
          <strong>${escapeHtml(place.facility_name)}</strong><br>
          Type: ${escapeHtml(place.facility_type)}<br>
          Locality: ${escapeHtml(place.locality)}<br>
          Address: ${escapeHtml(place.address_text)}<br>
          <small>${escapeHtml(place.source_note)}</small><br>
          ${sourceLink}
        `);
      }
    }).addTo(map);

    if (data.features.length > 0) {
      map.fitBounds(layer.getBounds(), { padding: [20, 20] });
    }

    status.textContent = `Loaded ${data.features.length} facility records from PostGIS.`;
  } catch (error) {
    console.error(error);
    status.textContent = "Could not connect to the database. Check the setup and .env file.";
  }
}

loadFacilities();
