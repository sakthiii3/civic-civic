"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import type { IssueCategory, Urgency } from "@prisma/client";
import { categoryLabels, urgencyLabels } from "@/lib/labels";
import { MapPickerDynamic } from "./MapPickerDynamic";

const categories = Object.keys(categoryLabels) as IssueCategory[];
const urgencies = Object.keys(urgencyLabels) as Urgency[];

const defaultLat = 23.3441;
const defaultLng = 85.3096;

export function ReportForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<IssueCategory>("POTHOLE");
  const [urgency, setUrgency] = useState<Urgency>("MEDIUM");
  const [lat, setLat] = useState(String(defaultLat));
  const [lng, setLng] = useState(String(defaultLng));
  const [address, setAddress] = useState("");
  const [citizenName, setCitizenName] = useState("");
  const [citizenPhone, setCitizenPhone] = useState("");
  const [citizenEmail, setCitizenEmail] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [voice, setVoice] = useState<File | null>(null);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ code: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => title.length >= 3 && description.length >= 10 && !busy,
    [title, description, busy],
  );

  async function fetchAddress(lt: string, lg: string) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lt}&lon=${lg}&zoom=18&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          setAddress(data.display_name);
        }
      }
    } catch (e) {
      console.warn("Reverse geocoding failed", e);
    }
  }

  function handleMapChange(newLat: number, newLng: number) {
    const sLat = String(newLat.toFixed(6));
    const sLng = String(newLng.toFixed(6));
    setLat(sLat);
    setLng(sLng);
    setGeoStatus("Location updated via map.");
    fetchAddress(sLat, sLng);
  }

  function useLocation() {
    setGeoStatus("Locating…");
    if (!navigator.geolocation) {
      setGeoStatus("Geolocation not available — using Ranchi demo point.");
      setLat(String(defaultLat));
      setLng(String(defaultLng));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const sLat = String(p.coords.latitude.toFixed(6));
        const sLng = String(p.coords.longitude.toFixed(6));
        setLat(sLat);
        setLng(sLng);
        setGeoStatus("Location captured.");
        fetchAddress(sLat, sLng);
      },
      () => {
        setGeoStatus("Permission denied — using demo coordinates (edit map).");
        setLat(String(defaultLat));
        setLng(String(defaultLng));
      },
      { enableHighAccuracy: true, timeout: 12_000 },
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const fd = new FormData();
    fd.set("title", title);
    fd.set("description", description);
    fd.set("category", category);
    fd.set("urgency", urgency);
    fd.set("lat", lat);
    fd.set("lng", lng);
    if (address) fd.set("address", address);
    if (citizenName) fd.set("citizenName", citizenName);
    if (citizenPhone) fd.set("citizenPhone", citizenPhone);
    if (citizenEmail) fd.set("citizenEmail", citizenEmail);
    if (photo) fd.set("photo", photo);
    if (voice) fd.set("voice", voice);

    try {
      const res = await fetch("/api/reports", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setErr(typeof data.error === "string" ? data.error : "Could not submit");
        return;
      }
      setDone({ code: data.trackingCode });
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-emerald-400/40 bg-emerald-950/60 p-8 text-center">
        <p className="text-emerald-200">Report received</p>
        <p className="mt-2 font-mono text-3xl font-bold text-white">{done.code}</p>
        <p className="mt-4 text-sm text-emerald-100/80">
          Save this code to track progress. Automated routing has assigned your
          case to the right department.
        </p>
        <Link
          href={`/track`}
          className="mt-6 inline-block rounded-xl bg-emerald-400 px-5 py-2.5 font-semibold text-emerald-950"
        >
          Go to tracker
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur md:grid-cols-2"
    >
      <div className="md:col-span-2">
        <label className="text-sm font-medium text-emerald-200">Title</label>
        <input
          required
          minLength={3}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-white"
          placeholder="Short summary (e.g. Pothole near crossing)"
        />
      </div>

      <div className="md:col-span-2">
        <label className="text-sm font-medium text-emerald-200">Description</label>
        <textarea
          required
          minLength={10}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-white"
          placeholder="What you saw, safety notes, approximate size…"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-emerald-200">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as IssueCategory)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-white"
        >
          {categories.map((c) => (
            <option key={c} value={c} className="bg-emerald-950">
              {categoryLabels[c]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-emerald-200">Urgency</label>
        <select
          value={urgency}
          onChange={(e) => setUrgency(e.target.value as Urgency)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-white"
        >
          {urgencies.map((u) => (
            <option key={u} value={u} className="bg-emerald-950">
              {urgencyLabels[u]}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="text-sm font-medium text-emerald-200 text-center block mb-2">Pinpoint precise location</label>
        <MapPickerDynamic
          lat={parseFloat(lat) || defaultLat}
          lng={parseFloat(lng) || defaultLng}
          onChange={handleMapChange}
        />
      </div>

      <div className="md:col-span-2">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[140px]">
            <label className="text-sm font-medium text-emerald-200">Latitude</label>
            <input
              required
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 font-mono text-sm text-white"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="text-sm font-medium text-emerald-200">Longitude</label>
            <input
              required
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 font-mono text-sm text-white"
            />
          </div>
          <button
            type="button"
            onClick={useLocation}
            className="rounded-xl border border-emerald-400/50 px-4 py-2.5 text-sm font-medium text-emerald-100 hover:bg-emerald-500/20"
          >
            Detect location
          </button>
        </div>
        {geoStatus && (
          <p className="mt-2 text-xs text-emerald-200/70">{geoStatus}</p>
        )}
      </div>

      <div className="md:col-span-2">
        <label className="text-sm font-medium text-emerald-200">
          Verified Address
        </label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-white text-sm"
          placeholder="Click on the map or type address..."
        />
      </div>

      <div>
        <label className="text-sm font-medium text-emerald-200">Your name</label>
        <input
          value={citizenName}
          onChange={(e) => setCitizenName(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-white"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-emerald-200">Phone</label>
        <input
          value={citizenPhone}
          onChange={(e) => setCitizenPhone(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-white"
        />
      </div>

      <div className="md:col-span-2">
        <label className="text-sm font-medium text-emerald-200">Email (optional)</label>
        <input
          type="email"
          value={citizenEmail}
          onChange={(e) => setCitizenEmail(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-white"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-emerald-200">Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
          className="mt-1 w-full text-sm text-emerald-100 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-3 file:py-2 file:font-medium file:text-emerald-950"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-emerald-200">
          Voice note (optional)
        </label>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setVoice(e.target.files?.[0] ?? null)}
          className="mt-1 w-full text-sm text-emerald-100 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-3 file:py-2 file:font-medium file:text-emerald-950"
        />
      </div>

      {err && (
        <p className="md:col-span-2 rounded-lg border border-red-400/40 bg-red-950/40 px-3 py-2 text-sm text-red-100">
          {err}
        </p>
      )}

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-xl bg-emerald-400 py-3.5 font-semibold text-emerald-950 hover:bg-emerald-300 disabled:opacity-50 sm:w-auto sm:px-10"
        >
          {busy ? "Submitting…" : "Submit report"}
        </button>
      </div>
    </form>
  );
}
