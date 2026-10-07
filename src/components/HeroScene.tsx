"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";

/* Brand gradient stops: lime, gold, cyan, deep teal (visual identity deck). */
const STOPS = ["#ccff66", "#f2ce19", "#3ef3ee", "#1b8fb0"].map((c) => new THREE.Color(c));

function gradient(t: number, out = new THREE.Color()) {
  const x = THREE.MathUtils.clamp(t, 0, 1) * (STOPS.length - 1);
  const i = Math.min(Math.floor(x), STOPS.length - 2);
  return out.copy(STOPS[i]).lerp(STOPS[i + 1], x - i);
}

/** Eight-point khatam: two overlapping squares, outer radius R, with an octagonal opening. */
function khatamGeometry(R: number, hole: number, depth: number, flip = false) {
  const inner = R * (Math.SQRT1_2 / Math.cos(Math.PI / 8));
  const shape = new THREE.Shape();
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8;
    const r = i % 2 === 0 ? R : inner;
    const x = r * Math.cos(a);
    const y = r * Math.sin(a);
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();

  const opening = new THREE.Path();
  for (let i = 0; i < 8; i++) {
    const a = -(i * Math.PI) / 4 - Math.PI / 8;
    const x = hole * Math.cos(a);
    const y = hole * Math.sin(a);
    if (i === 0) opening.moveTo(x, y);
    else opening.lineTo(x, y);
  }
  opening.closePath();
  shape.holes.push(opening);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 5,
    curveSegments: 4,
  });
  geo.translate(0, 0, -depth / 2);

  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const t = (pos.getX(i) / R) * 0.35 + (pos.getY(i) / R) * 0.35 + 0.5;
    gradient(flip ? 1 - t : t, c);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geo;
}

function drawCoinFace(kind: "btc" | "usdt" | "logo") {
  const size = 512;
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const g = cv.getContext("2d")!;
  const mid = size / 2;

  const fillDisc = (inner: string, outer: string) => {
    const grd = g.createRadialGradient(mid, mid * 0.8, 40, mid, mid, mid);
    grd.addColorStop(0, inner);
    grd.addColorStop(1, outer);
    g.fillStyle = grd;
    g.fillRect(0, 0, size, size);
  };
  const ring = (color: string) => {
    g.strokeStyle = color;
    g.lineWidth = 14;
    g.beginPath();
    g.arc(mid, mid, mid - 54, 0, Math.PI * 2);
    g.stroke();
  };

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;

  if (kind === "btc") {
    fillDisc("#ffe27a", "#c8960c");
    ring("#9a6f05");
    g.fillStyle = "#8a5f00";
    g.font = "900 300px 'Libre Franklin', Arial, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("B", mid, mid + 14);
    g.fillRect(mid - 38, mid - 190, 22, 70);
    g.fillRect(mid + 12, mid - 190, 22, 70);
    g.fillRect(mid - 38, mid + 120, 22, 70);
    g.fillRect(mid + 12, mid + 120, 22, 70);
  } else if (kind === "usdt") {
    fillDisc("#e9fffd", "#35c9c5");
    ring("#0a8c92");
    g.fillStyle = "#0c6f78";
    g.font = "900 290px 'Libre Franklin', Arial, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("T", mid, mid - 10);
    g.lineWidth = 16;
    g.strokeStyle = "#0c6f78";
    g.beginPath();
    g.ellipse(mid, mid - 70, 150, 36, 0, 0, Math.PI * 2);
    g.stroke();
    g.font = "800 46px 'Libre Franklin', Arial, sans-serif";
    g.fillText("USDT", mid, mid + 180);
  } else {
    fillDisc("#12186a", "#020326");
    ring("#3ef3ee");
    const img = new Image();
    img.onload = () => {
      const w = 300;
      const h = (img.height / img.width) * w;
      g.drawImage(img, mid - w / 2, mid - h / 2, w, h);
      tex.needsUpdate = true;
    };
    img.src = "/brand/logo-mark.png";
  }
  return tex;
}

type CoinKind = "btc" | "usdt" | "logo";

function Coin({
  kind,
  radius,
  phase,
  speed,
  orbit,
}: {
  kind: CoinKind;
  radius: number;
  phase: number;
  speed: number;
  orbit: [number, number, number];
}) {
  const group = useRef<THREE.Group>(null);
  const face = useMemo(() => drawCoinFace(kind), [kind]);
  const metal = useMemo(() => {
    const color = kind === "btc" ? "#e6b422" : kind === "usdt" ? "#d9f7f5" : "#0b0f5c";
    return new THREE.MeshPhysicalMaterial({
      color,
      metalness: 0.95,
      roughness: 0.22,
      clearcoat: 0.6,
      envMapIntensity: 1.3,
    });
  }, [kind]);
  const faceMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ map: face, metalness: 0.45, roughness: 0.32, clearcoat: 0.8, envMapIntensity: 1.1 }),
    [face],
  );

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime * speed + phase;
    g.position.set(Math.cos(t) * orbit[0], Math.sin(t * 1.3) * orbit[1], Math.sin(t) * orbit[2]);
    g.rotation.y = t * 1.6;
    g.rotation.x = Math.sin(t * 0.8) * 0.4;
  });

  return (
    <group ref={group}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={[metal, faceMat, faceMat]}>
        <cylinderGeometry args={[radius, radius, radius * 0.22, 72]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={metal}>
        <torusGeometry args={[radius, radius * 0.06, 16, 72]} />
      </mesh>
    </group>
  );
}

/** The brand's spiral line form: stacked thin rings that shift through the gradient. */
function Rings({ count }: { count: number }) {
  const rings = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        y: (i / (count - 1) - 0.5) * 2.9,
        color: `#${gradient(i / (count - 1)).getHexString()}`,
      })),
    [count],
  );
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.12;
  });
  return (
    <group ref={ref} rotation={[0.45, 0, 0.18]}>
      {rings.map((r, i) => (
        <mesh key={i} position={[0, r.y, 0]} rotation={[Math.PI / 2, 0, (i * Math.PI) / 36]}>
          <torusGeometry args={[2.25, 0.008, 6, 160]} />
          <meshBasicMaterial color={r.color} toneMapped={false} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

/** Three ascending bars from the 369 mark. */
function Bars() {
  const refs = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)];
  const base = [0.7, 1.15, 1.65];
  useFrame((state) => {
    refs.forEach((r, i) => {
      if (!r.current) return;
      const s = base[i] + Math.sin(state.clock.elapsedTime * 0.9 + i * 0.7) * 0.07;
      r.current.scale.y = s;
      r.current.position.y = -1.9 + s / 2;
    });
  });
  return (
    <group position={[2.3, 0, 0.4]} rotation={[0, -0.35, 0]}>
      {base.map((_, i) => (
        <mesh key={i} ref={refs[i]} position={[i * 0.3, -1.9, 0]}>
          <boxGeometry args={[0.16, 1, 0.16]} />
          <meshBasicMaterial color="#3ef3ee" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Rig({ small }: { small: boolean }) {
  const group = useRef<THREE.Group>(null);
  const star = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);

  const geoA = useMemo(() => khatamGeometry(1.55, 0.62, 0.36), []);
  const geoB = useMemo(() => khatamGeometry(0.95, 0.34, 0.3, true), []);
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        metalness: 0.55,
        roughness: 0.34,
        clearcoat: 0.7,
        clearcoatRoughness: 0.2,
        envMapIntensity: 0.9,
      }),
    [],
  );

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, state.pointer.x * 0.45, 3, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -state.pointer.y * 0.25, 3, dt);
    if (star.current) star.current.rotation.z += dt * 0.12;
    if (core.current) core.current.rotation.z -= dt * 0.2;
  });

  return (
    <group ref={group}>
      <mesh ref={star} geometry={geoA} material={mat} />
      <mesh ref={core} geometry={geoB} material={mat} position={[0, 0, 0.12]} rotation={[0, 0, Math.PI / 8]} />
      <Rings count={small ? 18 : 28} />
      <Bars />
      <Coin kind="btc" radius={0.62} phase={0} speed={0.32} orbit={[2.7, 0.9, 1.3]} />
      <Coin kind="usdt" radius={0.52} phase={2.1} speed={0.28} orbit={[2.9, 1.1, 1.4]} />
      <Coin kind="logo" radius={0.56} phase={4.2} speed={0.3} orbit={[2.6, 0.8, 1.2]} />
      {!small && (
        <>
          <Coin kind="usdt" radius={0.3} phase={1.0} speed={0.45} orbit={[2.2, 1.5, 1.0]} />
          <Coin kind="btc" radius={0.28} phase={3.3} speed={0.5} orbit={[2.4, 1.3, 0.9]} />
        </>
      )}
    </group>
  );
}

export default function HeroScene({ label, onReady }: { label: string; onReady?: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [small, setSmall] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const upd = () => setReduced(mq.matches);
    upd();
    mq.addEventListener("change", upd);
    setSmall(window.innerWidth < 768);
    const el = wrap.current;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.05 });
    if (el) io.observe(el);
    return () => {
      mq.removeEventListener("change", upd);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={wrap} role="img" aria-label={label} className="absolute inset-0">
      <Canvas
        dpr={[1, small ? 1.5 : 1.8]}
        camera={{ position: [0, 0, small ? 13.5 : 11.8], fov: 34 }}
        frameloop={active && !reduced ? "always" : "demand"}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          onReady?.();
        }}
      >
        <ambientLight intensity={0.25} />
        <directionalLight position={[3, 4, 5]} intensity={1.8} color="#fff1cf" />
        <directionalLight position={[-4, -2, 3]} intensity={0.9} color="#3ef3ee" />
        <Environment resolution={256}>
          <Lightformer form="rect" intensity={3.2} position={[0, 5, -4]} scale={[12, 3, 1]} color="#d6f4ff" />
          <Lightformer form="rect" intensity={2.2} position={[-6, 0, 2]} scale={[2, 8, 1]} color="#ffd36b" />
          <Lightformer form="rect" intensity={2} position={[6, -1, 3]} scale={[2, 8, 1]} color="#3ef3ee" />
          <Lightformer form="ring" intensity={1.2} position={[0, 0, 7]} scale={4} color="#ffffff" />
        </Environment>
        <Rig small={small} />
      </Canvas>
    </div>
  );
}
