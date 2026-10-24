// 3D Procedural Engine for MIR Rap History & Beat Odyssey
// Built with Three.js r160+ following all studio PBR, procedural asset, and game craft directives.

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  HistoricalLandmark,
  RAP_HISTORY_LANDMARKS,
  CollectableStem,
  INITIAL_STEMS,
} from './rapHistoryData.ts';
import { beatAudio } from './audioSynth.ts';

export type CameraViewMode = 'chase' | 'drone' | 'cockpit' | 'satellite';

export interface GamePlayerState {
  x: number;
  z: number;
  rotation: number;
  speed: number;
  isBoosting: boolean;
  score: number;
  stemsCollected: string[];
  coinsCollected: number;
  discoveredLandmarks: string[];
  activeLandmark: HistoricalLandmark | null;
  currentBpm: number;
  cameraMode: CameraViewMode;
  inStudioZone: boolean;
}

export type GameSceneMode = 'title' | 'playing' | 'story' | 'paused';

interface BoostStrip {
  x: number;
  z: number;
  rot: number;
}

interface VinylCoin {
  id: string;
  x: number;
  z: number;
  mesh: THREE.Group;
  collected: boolean;
}

export class RapBeatWorld3D {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private isSoftwareGl: boolean = false;
  private frameId: number = 0;
  private clock: THREE.Clock;

  // Scene objects
  private playerGroup: THREE.Group = new THREE.Group();
  private leftSpeakerMesh: THREE.Mesh | null = null;
  private rightSpeakerMesh: THREE.Mesh | null = null;
  private leftCassetteSpool: THREE.Mesh | null = null;
  private rightCassetteSpool: THREE.Mesh | null = null;
  private turntablePlatter: THREE.Mesh | null = null;
  private boosterLight: THREE.PointLight | null = null;
  private underglowMesh: THREE.Mesh | null = null;

  // Studio Centerpiece (Inspired by uploaded studio & pipeline assets)
  private studioGroup: THREE.Group = new THREE.Group();
  private pipelineHoloNode: THREE.Group = new THREE.Group();
  private monitorWaveformTex: THREE.CanvasTexture | null = null;
  private monitorWaveformCtx: CanvasRenderingContext2D | null = null;

  // World elements
  private landmarkMeshes: Map<string, THREE.Group> = new Map();
  private stemMeshes: Map<string, THREE.Group> = new Map();
  private activeStems: CollectableStem[] = [...INITIAL_STEMS];
  private boostStrips: BoostStrip[] = [];
  private vinylCoins: VinylCoin[] = [];

  // Dynamic animations
  private pulseRings: THREE.Mesh[] = [];

  // Game and camera state
  private mode: GameSceneMode = 'title';
  private cameraMode: CameraViewMode = 'chase';
  private keysHeld: Set<string> = new Set();
  private onStateChange: (state: GamePlayerState) => void;
  private onLandmarkInteract: (landmark: HistoricalLandmark) => void;
  private onStemCollect: (stem: CollectableStem) => void;
  private onStudioInteract?: () => void;

  private playerState: GamePlayerState = {
    x: 0,
    z: 16,
    rotation: 0,
    speed: 0,
    isBoosting: false,
    score: 0,
    stemsCollected: [],
    coinsCollected: 0,
    discoveredLandmarks: [],
    activeLandmark: null,
    currentBpm: 94,
    cameraMode: 'chase',
    inStudioZone: true,
  };

  constructor(
    container: HTMLElement,
    callbacks: {
      onStateChange: (state: GamePlayerState) => void;
      onLandmarkInteract: (landmark: HistoricalLandmark) => void;
      onStemCollect: (stem: CollectableStem) => void;
      onStudioInteract?: () => void;
    },
  ) {
    this.container = container;
    this.onStateChange = callbacks.onStateChange;
    this.onLandmarkInteract = callbacks.onLandmarkInteract;
    this.onStemCollect = callbacks.onStemCollect;
    this.onStudioInteract = callbacks.onStudioInteract;
    this.clock = new THREE.Clock();

    // 1. Detect software WebGL safely
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup high-performance PBR renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2),
    );
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);

    // 3. Setup Scene, Fog & Environment reflections
    this.scene = new THREE.Scene();
    const horizonColor = new THREE.Color(0x0b0f19);
    this.scene.background = horizonColor;
    this.scene.fog = new THREE.FogExp2(horizonColor.getHex(), 0.012);

    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04,
    ).texture;
    pmremGenerator.dispose();

    // 4. Setup Camera
    this.camera = new THREE.PerspectiveCamera(
      55,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      600,
    );
    this.camera.position.set(0, 16, 32);

    // 5. Lighting Rig
    this.setupLighting();

    // 6. Build 3D City Floor and Roads
    this.buildGroundAndGrid();

    // 7. Build Musaix Pro Studio Centerpiece & Pipeline Hologram
    this.buildStudioCenterpiece();

    // 8. Build Boost Strips and Vinyl Coins
    this.buildBoostStripsAndCoins();

    // 9. Build Procedural Landmarks
    this.buildLandmarks();

    // 10. Build Collectable MIR Stems
    this.buildStems();

    // 11. Build Player's Composite 3D Boombox Cruiser
    this.buildPlayerCruiser();

    // 12. Register Listeners & Start Loop
    this.setupEventListeners();
    this.startLoop();
  }

  private setupLighting() {
    // Warm key light
    const keyLight = new THREE.DirectionalLight(0xfff3d6, 2.2);
    keyLight.position.set(30, 50, 25);
    if (!this.isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 10;
      keyLight.shadow.camera.far = 160;
      keyLight.shadow.camera.left = -60;
      keyLight.shadow.camera.right = 60;
      keyLight.shadow.camera.top = 60;
      keyLight.shadow.camera.bottom = -60;
      keyLight.shadow.bias = -0.0004;
      keyLight.shadow.normalBias = 0.02;
    }
    this.scene.add(keyLight);

    // Cool hemisphere fill
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x090d16, 1.2);
    this.scene.add(hemiLight);

    // Studio neon rim
    const rimLight = new THREE.DirectionalLight(0xf59e0b, 1.4);
    rimLight.position.set(-30, 20, -35);
    this.scene.add(rimLight);
  }

  private buildGroundAndGrid() {
    const groundGeo = new THREE.PlaneGeometry(320, 320, 32, 32);
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(0, 0, 512, 512);

    // Main street grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    for (let i = 0; i <= 512; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }

    // Street center dashes
    ctx.strokeStyle = '#334155';
    ctx.setLineDash([8, 8]);
    ctx.lineWidth = 2;
    for (let i = 32; i <= 512; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Glowing cyan intersection nodes
    ctx.fillStyle = '#38bdf8';
    for (let x = 64; x < 512; x += 128) {
      for (let y = 64; y < 512; y += 128) {
        ctx.fillRect(x - 3, y - 3, 6, 6);
      }
    }

    const groundTex = new THREE.CanvasTexture(canvas);
    groundTex.wrapS = THREE.RepeatWrapping;
    groundTex.wrapT = THREE.RepeatWrapping;
    groundTex.repeat.set(16, 16);
    groundTex.colorSpace = THREE.SRGBColorSpace;
    groundTex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.85,
      metalness: 0.2,
    });

    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = !this.isSoftwareGl;
    this.scene.add(groundMesh);

    // Perimeter skyline towers
    const skylineGroup = new THREE.Group();
    const pillarGeo = new THREE.BoxGeometry(7, 45, 7);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.9,
      metalness: 0.1,
    });

    for (let i = 0; i < 48; i++) {
      const angle = (i / 48) * Math.PI * 2;
      const radius = 135 + (Math.sin(i * 3) * 15);
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(Math.cos(angle) * radius, 18 + Math.sin(i * 5) * 6, Math.sin(angle) * radius);
      pillar.scale.y = 0.5 + Math.random() * 1.2;
      skylineGroup.add(pillar);
    }
    this.scene.add(skylineGroup);
  }

  // Build Musaix Pro Studio Centerpiece & Pipeline Hologram
  private buildStudioCenterpiece() {
    this.studioGroup = new THREE.Group();
    this.studioGroup.position.set(0, 0, 0);

    // 1. Studio Circular Walnut Stage Floor
    const stageGeo = new THREE.CylinderGeometry(11, 11.5, 0.6, 32);
    const walnutMat = new THREE.MeshStandardMaterial({
      color: 0x3d2314, // Rich dark walnut
      roughness: 0.35,
      metalness: 0.1,
    });
    const stage = new THREE.Mesh(stageGeo, walnutMat);
    stage.position.y = 0.3;
    stage.receiveShadow = !this.isSoftwareGl;
    this.studioGroup.add(stage);

    // Outer neon ring
    const neonRing = new THREE.Mesh(
      new THREE.RingGeometry(11.2, 11.7, 32),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide }),
    );
    neonRing.rotation.x = -Math.PI / 2;
    neonRing.position.y = 0.62;
    this.studioGroup.add(neonRing);

    // 2. Curved Walnut Master Console Desk (Matching uploaded studio photo!)
    const deskGeo = new THREE.BoxGeometry(10, 1.2, 3.2);
    const desk = new THREE.Mesh(deskGeo, walnutMat);
    desk.position.set(0, 1.3, -2);
    desk.castShadow = !this.isSoftwareGl;
    this.studioGroup.add(desk);

    // Left and right angled wing desk racks
    [-5.6, 5.6].forEach((xOff, idx) => {
      const wingGeo = new THREE.BoxGeometry(2.8, 1.2, 3.2);
      const wing = new THREE.Mesh(wingGeo, walnutMat);
      wing.position.set(xOff, 1.3, -1.4);
      wing.rotation.y = idx === 0 ? 0.35 : -0.35;
      this.studioGroup.add(wing);

      // Studio Monitor Speakers on Desk Wings
      const monBoxGeo = new THREE.BoxGeometry(1.2, 1.8, 1.2);
      const monMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
      const monitor = new THREE.Mesh(monBoxGeo, monMat);
      monitor.position.set(xOff, 2.8, -1.4);
      this.studioGroup.add(monitor);

      // Monitor speaker white cone
      const cone = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }),
      );
      cone.rotation.x = Math.PI / 2;
      cone.position.set(xOff, 2.7, -0.75);
      this.studioGroup.add(cone);
    });

    // 3. Dual Monitor Waveform Screens
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    this.monitorWaveformCtx = canvas.getContext('2d')!;
    this.monitorWaveformTex = new THREE.CanvasTexture(canvas);

    const screenGeo = new THREE.PlaneGeometry(2.6, 1.4);
    const screenMat = new THREE.MeshBasicMaterial({ map: this.monitorWaveformTex });
    [-1.5, 1.5].forEach((xOff) => {
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.set(xOff, 2.4, -2.1);
      this.studioGroup.add(screen);
    });

    // 4. Floating Holographic Pipeline Cube Node (Inspired by uploaded isometric pipeline asset)
    this.pipelineHoloNode = new THREE.Group();
    this.pipelineHoloNode.position.set(0, 4.2, 0);

    const holoCubeGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
    const holoCubeMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.8,
      wireframe: true,
    });
    const holoCube = new THREE.Mesh(holoCubeGeo, holoCubeMat);
    this.pipelineHoloNode.add(holoCube);

    const coreLight = new THREE.PointLight(0x38bdf8, 2.5, 12);
    this.pipelineHoloNode.add(coreLight);
    this.studioGroup.add(this.pipelineHoloNode);

    // Studio Stage Signboard
    const signGeo = new THREE.BoxGeometry(8, 0.6, 0.2);
    const signMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.7,
    });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 2.2, -3.5);
    this.studioGroup.add(sign);

    this.scene.add(this.studioGroup);
  }

  // Build Speed Boost Strips and Vinyl Coin Pickups
  private buildBoostStripsAndCoins() {
    this.boostStrips = [
      { x: 0, z: -25, rot: 0 },
      { x: 0, z: 25, rot: Math.PI },
      { x: -25, z: 0, rot: Math.PI / 2 },
      { x: 25, z: 0, rot: -Math.PI / 2 },
    ];

    const stripGeo = new THREE.PlaneGeometry(4, 8);
    const stripCanvas = document.createElement('canvas');
    stripCanvas.width = 128;
    stripCanvas.height = 256;
    const sCtx = stripCanvas.getContext('2d')!;
    sCtx.fillStyle = '#0284c7';
    sCtx.fillRect(0, 0, 128, 256);
    sCtx.fillStyle = '#38bdf8';
    // Draw 3 forward chevrons
    for (let y = 40; y < 240; y += 70) {
      sCtx.beginPath();
      sCtx.moveTo(64, y - 30);
      sCtx.lineTo(110, y + 20);
      sCtx.lineTo(64, y);
      sCtx.lineTo(18, y + 20);
      sCtx.closePath();
      sCtx.fill();
    }

    const stripTex = new THREE.CanvasTexture(stripCanvas);
    stripTex.colorSpace = THREE.SRGBColorSpace;
    const stripMat = new THREE.MeshBasicMaterial({ map: stripTex });

    this.boostStrips.forEach((strip) => {
      const mesh = new THREE.Mesh(stripGeo, stripMat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.rotation.z = strip.rot;
      mesh.position.set(strip.x, 0.06, strip.z);
      this.scene.add(mesh);
    });

    // 16 Collectable Vinyl Record Coins
    const coinGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.06, 24);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      metalness: 0.8,
      roughness: 0.25,
    });
    const labelMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });

    const coinPositions: [number, number][] = [
      [15, -15], [20, -20], [-15, -15], [-20, -20],
      [15, 15], [20, 20], [-15, 15], [-20, 20],
      [0, -55], [0, 55], [-55, 0], [55, 0],
      [-25, -50], [25, -50], [-25, 50], [25, 50],
    ];

    coinPositions.forEach(([x, z], idx) => {
      const coinGroup = new THREE.Group();
      coinGroup.position.set(x, 1.2, z);

      const platter = new THREE.Mesh(coinGeo, coinMat);
      platter.rotation.x = Math.PI / 2;
      coinGroup.add(platter);

      const label = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 16), labelMat);
      label.rotation.x = Math.PI / 2;
      coinGroup.add(label);

      this.scene.add(coinGroup);
      this.vinylCoins.push({
        id: `coin_${idx}`,
        x,
        z,
        mesh: coinGroup,
        collected: false,
      });
    });
  }

  // Composite 3–12 Part Procedural Player Boombox Cruiser
  private buildPlayerCruiser() {
    this.playerGroup = new THREE.Group();

    // Part 1: Main Boombox Chassis
    const chassisGeo = new THREE.BoxGeometry(3.6, 1.8, 1.6);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.22,
    });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.y = 1.1;
    chassis.castShadow = !this.isSoftwareGl;
    this.playerGroup.add(chassis);

    // Part 2 & 3: Dual Speaker Cones (Audio-reactive bounce!)
    const speakerRimGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.1, 24);
    const speakerConeGeo = new THREE.ConeGeometry(0.48, 0.2, 24);
    const speakerMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.8,
      metalness: 0.1,
    });
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.95,
      roughness: 0.1,
    });

    // Left Speaker
    const leftRim = new THREE.Mesh(speakerRimGeo, chromeMat);
    leftRim.rotation.x = Math.PI / 2;
    leftRim.position.set(-1.0, 1.1, 0.82);
    this.playerGroup.add(leftRim);

    this.leftSpeakerMesh = new THREE.Mesh(speakerConeGeo, speakerMat);
    this.leftSpeakerMesh.rotation.x = -Math.PI / 2;
    this.leftSpeakerMesh.position.set(-1.0, 1.1, 0.8);
    this.playerGroup.add(this.leftSpeakerMesh);

    // Right Speaker
    const rightRim = new THREE.Mesh(speakerRimGeo, chromeMat);
    rightRim.rotation.x = Math.PI / 2;
    rightRim.position.set(1.0, 1.1, 0.82);
    this.playerGroup.add(rightRim);

    this.rightSpeakerMesh = new THREE.Mesh(speakerConeGeo, speakerMat);
    this.rightSpeakerMesh.rotation.x = -Math.PI / 2;
    this.rightSpeakerMesh.position.set(1.0, 1.1, 0.8);
    this.playerGroup.add(this.rightSpeakerMesh);

    // Part 4 & 5: Dual Rotating Cassette Spools
    const spoolGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.08, 16);
    const spoolMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.5,
      roughness: 0.3,
    });
    this.leftCassetteSpool = new THREE.Mesh(spoolGeo, spoolMat);
    this.leftCassetteSpool.rotation.x = Math.PI / 2;
    this.leftCassetteSpool.position.set(-0.25, 1.1, 0.84);
    this.playerGroup.add(this.leftCassetteSpool);

    this.rightCassetteSpool = new THREE.Mesh(spoolGeo, spoolMat);
    this.rightCassetteSpool.rotation.x = Math.PI / 2;
    this.rightCassetteSpool.position.set(0.25, 1.1, 0.84);
    this.playerGroup.add(this.rightCassetteSpool);

    // Part 6: Top Turntable Vinyl Platter
    const platterGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.08, 32);
    const vinylMat = new THREE.MeshStandardMaterial({
      color: 0x050505,
      roughness: 0.35,
      metalness: 0.6,
    });
    this.turntablePlatter = new THREE.Mesh(platterGeo, vinylMat);
    this.turntablePlatter.position.set(0, 2.05, 0);
    this.playerGroup.add(this.turntablePlatter);

    const labelGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.09, 24);
    const labelMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
    const label = new THREE.Mesh(labelGeo, labelMat);
    label.position.set(0, 2.06, 0);
    this.playerGroup.add(label);

    // Part 7: Tonearm
    const tonearmGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.6, 8);
    const tonearm = new THREE.Mesh(tonearmGeo, chromeMat);
    tonearm.rotation.z = Math.PI / 2;
    tonearm.rotation.y = 0.4;
    tonearm.position.set(0.45, 2.12, -0.2);
    this.playerGroup.add(tonearm);

    // Part 8: Chrome Antennas
    const antennaGeo = new THREE.CylinderGeometry(0.025, 0.015, 1.4, 8);
    [-1.5, 1.5].forEach((xOffset, idx) => {
      const ant = new THREE.Mesh(antennaGeo, chromeMat);
      ant.rotation.z = idx === 0 ? 0.35 : -0.35;
      ant.position.set(xOffset, 2.5, -0.5);
      this.playerGroup.add(ant);
    });

    // Part 9: LED VU Meter
    const meterMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 0.8,
    });
    const meter = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.05), meterMat);
    meter.position.set(0, 1.7, 0.82);
    this.playerGroup.add(meter);

    // Part 10: Booster Thrusters
    const thrusterGeo = new THREE.CylinderGeometry(0.18, 0.25, 0.4, 16);
    [-0.8, 0.8].forEach((xOffset) => {
      const thruster = new THREE.Mesh(thrusterGeo, chromeMat);
      thruster.rotation.x = Math.PI / 2;
      thruster.position.set(xOffset, 0.8, -0.85);
      this.playerGroup.add(thruster);
    });

    this.boosterLight = new THREE.PointLight(0x38bdf8, 0, 8);
    this.boosterLight.position.set(0, 0.8, -1.2);
    this.playerGroup.add(this.boosterLight);

    // Part 11: Neon Underglow
    const underglowGeo = new THREE.RingGeometry(1.2, 1.9, 24);
    const underglowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.underglowMesh = new THREE.Mesh(underglowGeo, underglowMat);
    this.underglowMesh.rotation.x = -Math.PI / 2;
    this.underglowMesh.position.y = 0.04;
    this.playerGroup.add(this.underglowMesh);

    // Part 12: Contact Shadow
    const shadowGeo = new THREE.PlaneGeometry(4.2, 2.4);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    this.playerGroup.add(shadow);

    this.playerGroup.position.set(this.playerState.x, 0, this.playerState.z);
    this.scene.add(this.playerGroup);
  }

  // Build Procedural 3D Historical Landmarks
  private buildLandmarks() {
    RAP_HISTORY_LANDMARKS.forEach((lm) => {
      const lmGroup = new THREE.Group();
      lmGroup.position.set(lm.position3D[0], 0, lm.position3D[2]);

      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x1f2937,
        roughness: 0.8,
        metalness: 0.2,
      });

      const accentMat = new THREE.MeshStandardMaterial({
        color: lm.color,
        roughness: 0.3,
        metalness: 0.7,
        emissive: lm.color,
        emissiveIntensity: 0.25,
      });

      if (lm.id === 'bronx_1520_sedgwick') {
        const bldgGeo = new THREE.BoxGeometry(14, 22, 14);
        const bldg = new THREE.Mesh(bldgGeo, baseMat);
        bldg.position.y = 11;
        bldg.castShadow = !this.isSoftwareGl;
        lmGroup.add(bldg);

        [-5, 5].forEach((xOff) => {
          const spk = new THREE.Mesh(new THREE.BoxGeometry(3, 8, 3), accentMat);
          spk.position.set(xOff, 4, 8);
          lmGroup.add(spk);
        });

        const signMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          emissive: 0xf59e0b,
          emissiveIntensity: 0.6,
        });
        const sign = new THREE.Mesh(new THREE.BoxGeometry(12, 3, 0.4), signMat);
        sign.position.set(0, 19, 7.2);
        lmGroup.add(sign);
      } else if (lm.id === 'queensbridge_houses') {
        const table = new THREE.Mesh(new THREE.BoxGeometry(16, 6, 12), baseMat);
        table.position.y = 3;
        lmGroup.add(table);

        const padGeo = new THREE.BoxGeometry(1.6, 0.4, 1.6);
        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 4; col++) {
            const pad = new THREE.Mesh(padGeo, accentMat);
            pad.position.set(-3.6 + col * 2.4, 6.2, -3.6 + row * 2.4);
            lmGroup.add(pad);
          }
        }
      } else if (lm.id === 'compton_central_ave') {
        const car = new THREE.Mesh(new THREE.BoxGeometry(12, 2.5, 6), accentMat);
        car.position.y = 2.4;
        lmGroup.add(car);

        [-10, 10].forEach((xOff) => {
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 14, 8), baseMat);
          trunk.position.set(xOff, 7, -6);
          lmGroup.add(trunk);

          const leaves = new THREE.Mesh(new THREE.ConeGeometry(4, 3, 8), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
          leaves.position.set(xOff, 14, -6);
          lmGroup.add(leaves);
        });
      } else if (lm.id === 'atlanta_dungeon_family') {
        const mono = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, 24, 24), baseMat);
        mono.position.y = 12;
        lmGroup.add(mono);

        for (let r = 0; r < 4; r++) {
          const ring = new THREE.Mesh(new THREE.TorusGeometry(5.2 - r * 0.4, 0.35, 12, 32), accentMat);
          ring.rotation.x = Math.PI / 2;
          ring.position.y = 4 + r * 5;
          lmGroup.add(ring);
          this.pulseRings.push(ring);
        }
      } else {
        const tower = new THREE.Mesh(new THREE.BoxGeometry(8, 20, 8), baseMat);
        tower.position.y = 10;
        lmGroup.add(tower);

        const crown = new THREE.Mesh(new THREE.OctahedronGeometry(3.5), accentMat);
        crown.position.y = 22;
        lmGroup.add(crown);
      }

      const beaconMat = new THREE.MeshBasicMaterial({
        color: lm.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4,
      });
      const beacon = new THREE.Mesh(new THREE.RingGeometry(8, 9, 32), beaconMat);
      beacon.rotation.x = -Math.PI / 2;
      beacon.position.y = 0.05;
      lmGroup.add(beacon);

      this.scene.add(lmGroup);
      this.landmarkMeshes.set(lm.id, lmGroup);
    });
  }

  // Build Floating Collectable MIR Stems
  private buildStems() {
    this.activeStems.forEach((stem) => {
      const stemGroup = new THREE.Group();
      stemGroup.position.set(stem.position3D[0], stem.position3D[1], stem.position3D[2]);

      let iconGeo: THREE.BufferGeometry;
      let color = 0xf59e0b;

      if (stem.type === 'drums') {
        iconGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.5, 16);
        color = 0xf59e0b;
      } else if (stem.type === 'bass') {
        iconGeo = new THREE.TorusGeometry(0.7, 0.25, 12, 24);
        color = 0xef4444;
      } else if (stem.type === 'sample') {
        iconGeo = new THREE.BoxGeometry(1.2, 1.2, 0.2);
        color = 0x3b82f6;
      } else {
        iconGeo = new THREE.OctahedronGeometry(0.8);
        color = 0x10b981;
      }

      const stemMat = new THREE.MeshStandardMaterial({
        color,
        metalness: 0.7,
        roughness: 0.2,
        emissive: color,
        emissiveIntensity: 0.4,
      });

      const icon = new THREE.Mesh(iconGeo, stemMat);
      stemGroup.add(icon);

      const stemShadow = new THREE.Mesh(
        new THREE.CircleGeometry(0.9, 16),
        new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4 }),
      );
      stemShadow.rotation.x = -Math.PI / 2;
      stemShadow.position.y = -stem.position3D[1] + 0.05;
      stemGroup.add(stemShadow);

      this.scene.add(stemGroup);
      this.stemMeshes.set(stem.id, stemGroup);
    });
  }

  private setupEventListeners() {
    window.addEventListener('resize', this.onResize);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onWindowBlur);
  }

  private onResize = () => {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private onKeyDown = (e: KeyboardEvent) => {
    this.keysHeld.add(e.code);

    if (e.code === 'KeyM') {
      beatAudio.setMute(!beatAudio.getMuted());
    }

    if (e.code === 'KeyC') {
      // Toggle Camera View Mode
      const modes: CameraViewMode[] = ['chase', 'drone', 'cockpit', 'satellite'];
      const nextIdx = (modes.indexOf(this.cameraMode) + 1) % modes.length;
      this.setCameraMode(modes[nextIdx]);
    }

    if (e.code === 'KeyB') {
      // Toggle Sequencer
      beatAudio.toggleSequencer();
    }

    if (e.code === 'Space' && this.mode === 'title') {
      e.preventDefault();
      this.setMode('playing');
      beatAudio.init();
      beatAudio.playLandmarkDiscovered();
    }

    if (e.code === 'KeyE') {
      if (this.playerState.activeLandmark) {
        this.onLandmarkInteract(this.playerState.activeLandmark);
      } else if (this.playerState.inStudioZone && this.onStudioInteract) {
        this.onStudioInteract();
      }
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keysHeld.delete(e.code);
  };

  private onWindowBlur = () => {
    this.keysHeld.clear();
  };

  public setMode(mode: GameSceneMode) {
    this.mode = mode;
  }

  public setCameraMode(mode: CameraViewMode) {
    this.cameraMode = mode;
    this.playerState.cameraMode = mode;
    this.onStateChange({ ...this.playerState });
  }

  public teleportToLandmark(landmarkId: string) {
    const lm = RAP_HISTORY_LANDMARKS.find((l) => l.id === landmarkId);
    if (!lm) return;
    this.playerState.x = lm.position3D[0];
    this.playerState.z = lm.position3D[2] + 12;
    this.playerState.rotation = 0;
    this.playerState.speed = 0;
    this.playerGroup.position.set(this.playerState.x, 0, this.playerState.z);
    this.playerState.currentBpm = lm.mirFeatures.tempoBpm;
    beatAudio.setBpm(lm.mirFeatures.tempoBpm);
    beatAudio.playLandmarkDiscovered();
  }

  // 60FPS simulation loop with clamped delta
  private startLoop() {
    const tick = () => {
      const dt = Math.min(this.clock.getDelta(), 0.05);
      const time = this.clock.getElapsedTime();

      // Animate ambient pulse rings
      this.pulseRings.forEach((ring, idx) => {
        const s = 1 + Math.sin(time * 3 + idx) * 0.08;
        ring.scale.set(s, s, 1);
      });

      // Animate floating MIR stems
      this.stemMeshes.forEach((mesh) => {
        mesh.rotation.y += dt * 1.5;
        mesh.position.y = 1.2 + Math.sin(time * 2.5 + mesh.position.x) * 0.3;
      });

      // Animate Vinyl Coins (Spinning)
      this.vinylCoins.forEach((coin) => {
        if (!coin.collected) {
          coin.mesh.rotation.y += dt * 3;
        }
      });

      // Animate Floating Pipeline Hologram Node
      if (this.pipelineHoloNode) {
        this.pipelineHoloNode.rotation.y += dt * 0.8;
        this.pipelineHoloNode.rotation.x = Math.sin(time * 1.2) * 0.2;
      }

      // Dynamic Studio Monitor Waveform Animation
      if (this.monitorWaveformCtx && this.monitorWaveformTex) {
        const ctx = this.monitorWaveformCtx;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 256, 128);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < 256; x += 4) {
          const y = 64 + Math.sin(x * 0.1 + time * 10) * (beatAudio.isPlaying() ? 35 : 12);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        this.monitorWaveformTex.needsUpdate = true;
      }

      // Speaker Cone Pulse
      if (this.leftSpeakerMesh && this.rightSpeakerMesh) {
        const pulse = Math.sin(time * 15) * (beatAudio.isPlaying() ? 0.08 : 0.02);
        this.leftSpeakerMesh.position.z = 0.8 + pulse;
        this.rightSpeakerMesh.position.z = 0.8 + pulse;
      }

      if (this.mode === 'title') {
        const camX = Math.cos(time * 0.25) * 45;
        const camZ = Math.sin(time * 0.25) * 45;
        this.camera.position.set(camX, 18 + Math.sin(time * 0.4) * 4, camZ);
        this.camera.lookAt(0, 4, 0);
      } else if (this.mode === 'playing') {
        this.updatePlayerMovement(dt);
        this.updateCameraFollow(dt);
        this.checkCollisions();
      }

      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    if (this.isSoftwareGl) {
      this.afterDraw(tick);
    } else {
      this.frameId = requestAnimationFrame(tick);
    }
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 60);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private updatePlayerMovement(dt: number) {
    const forwardKey = this.keysHeld.has('KeyW') || this.keysHeld.has('ArrowUp');
    const backwardKey = this.keysHeld.has('KeyS') || this.keysHeld.has('ArrowDown');
    const leftKey = this.keysHeld.has('KeyA') || this.keysHeld.has('ArrowLeft');
    const rightKey = this.keysHeld.has('KeyD') || this.keysHeld.has('ArrowRight');
    const boostKey = this.keysHeld.has('Space') || this.keysHeld.has('ShiftLeft');

    // Steering
    if (leftKey) this.playerState.rotation += 2.8 * dt;
    if (rightKey) this.playerState.rotation -= 2.8 * dt;

    // Acceleration & Braking
    const maxSpeed = boostKey ? 32 : 18;
    const accel = boostKey ? 40 : 24;

    if (forwardKey) {
      this.playerState.speed = Math.min(this.playerState.speed + accel * dt, maxSpeed);
      if (boostKey && !this.playerState.isBoosting) {
        beatAudio.playBoost();
      }
    } else if (backwardKey) {
      this.playerState.speed = Math.max(this.playerState.speed - accel * dt, -12);
    } else {
      this.playerState.speed *= 0.94;
    }

    this.playerState.isBoosting = boostKey && forwardKey;

    // Check Speed Boost Strip Collisions
    for (const strip of this.boostStrips) {
      const dx = this.playerState.x - strip.x;
      const dz = this.playerState.z - strip.z;
      if (Math.abs(dx) < 2.5 && Math.abs(dz) < 4.0) {
        this.playerState.speed = Math.min(this.playerState.speed + 18, 42);
        this.playerState.isBoosting = true;
        beatAudio.playBoost();
      }
    }

    // Advance position
    const moveX = Math.sin(this.playerState.rotation) * this.playerState.speed * dt;
    const moveZ = Math.cos(this.playerState.rotation) * this.playerState.speed * dt;

    this.playerState.x += moveX;
    this.playerState.z += moveZ;

    // Bounds limit
    this.playerState.x = Math.max(-105, Math.min(105, this.playerState.x));
    this.playerState.z = Math.max(-105, Math.min(105, this.playerState.z));

    // Studio Zone Detection (Near 0, 0)
    const distToStudio = Math.sqrt(this.playerState.x * this.playerState.x + this.playerState.z * this.playerState.z);
    this.playerState.inStudioZone = distToStudio < 14;

    // Update 3D Object Group
    this.playerGroup.position.set(this.playerState.x, 0, this.playerState.z);
    this.playerGroup.rotation.y = this.playerState.rotation;

    // Spin player cassette spools and turntable vinyl
    if (this.leftCassetteSpool && this.rightCassetteSpool) {
      const spoolSpin = this.playerState.speed * dt * 2.5;
      this.leftCassetteSpool.rotation.z += spoolSpin;
      this.rightCassetteSpool.rotation.z += spoolSpin;
    }
    if (this.turntablePlatter) {
      this.turntablePlatter.rotation.y += (this.playerState.speed * 0.1 + 0.8) * dt;
    }

    // Nitro booster light
    if (this.boosterLight) {
      this.boosterLight.intensity = this.playerState.isBoosting ? 4 : 0;
    }
  }

  private updateCameraFollow(dt: number) {
    const damp = 1 - Math.exp(-8 * dt);

    if (this.cameraMode === 'chase') {
      const chaseDist = this.playerState.isBoosting ? 15 : 12;
      const chaseHeight = this.playerState.isBoosting ? 6.8 : 5.8;

      const targetCamX = this.playerState.x - Math.sin(this.playerState.rotation) * chaseDist;
      const targetCamZ = this.playerState.z - Math.cos(this.playerState.rotation) * chaseDist;
      const targetCamY = chaseHeight;

      this.camera.position.x += (targetCamX - this.camera.position.x) * damp;
      this.camera.position.y += (targetCamY - this.camera.position.y) * damp;
      this.camera.position.z += (targetCamZ - this.camera.position.z) * damp;

      const lookTarget = new THREE.Vector3(
        this.playerState.x + Math.sin(this.playerState.rotation) * 4,
        1.5,
        this.playerState.z + Math.cos(this.playerState.rotation) * 4,
      );
      this.camera.lookAt(lookTarget);
    } else if (this.cameraMode === 'drone') {
      // Isometric 45-degree angle (Inspired by uploaded isometric tech pipeline photo!)
      const targetCamX = this.playerState.x + 28;
      const targetCamY = 32;
      const targetCamZ = this.playerState.z + 28;

      this.camera.position.x += (targetCamX - this.camera.position.x) * damp;
      this.camera.position.y += (targetCamY - this.camera.position.y) * damp;
      this.camera.position.z += (targetCamZ - this.camera.position.z) * damp;
      this.camera.lookAt(this.playerState.x, 1.2, this.playerState.z);
    } else if (this.cameraMode === 'cockpit') {
      // Front hood driver view
      const targetCamX = this.playerState.x + Math.sin(this.playerState.rotation) * 1.8;
      const targetCamZ = this.playerState.z + Math.cos(this.playerState.rotation) * 1.8;
      const targetCamY = 2.2;

      this.camera.position.set(targetCamX, targetCamY, targetCamZ);
      const lookTarget = new THREE.Vector3(
        this.playerState.x + Math.sin(this.playerState.rotation) * 18,
        1.8,
        this.playerState.z + Math.cos(this.playerState.rotation) * 18,
      );
      this.camera.lookAt(lookTarget);
    } else if (this.cameraMode === 'satellite') {
      // Top-down tactical radar
      this.camera.position.set(this.playerState.x, 70, this.playerState.z);
      this.camera.lookAt(this.playerState.x, 0, this.playerState.z);
    }
  }

  private checkCollisions() {
    // 1. Check Landmark proximity
    let closestLandmark: HistoricalLandmark | null = null;
    let minDist = 14;

    RAP_HISTORY_LANDMARKS.forEach((lm) => {
      const dx = this.playerState.x - lm.position3D[0];
      const dz = this.playerState.z - lm.position3D[2];
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < minDist) {
        minDist = dist;
        closestLandmark = lm;
      }
    });

    if (closestLandmark) {
      this.playerState.activeLandmark = closestLandmark;
      if (!this.playerState.discoveredLandmarks.includes((closestLandmark as HistoricalLandmark).id)) {
        this.playerState.discoveredLandmarks.push((closestLandmark as HistoricalLandmark).id);
        this.playerState.score += 500;
        this.playerState.currentBpm = (closestLandmark as HistoricalLandmark).mirFeatures.tempoBpm;
        beatAudio.setBpm((closestLandmark as HistoricalLandmark).mirFeatures.tempoBpm);
        beatAudio.playLandmarkDiscovered();
      }
    } else {
      this.playerState.activeLandmark = null;
    }

    // 2. Check Collectable Stem Pickups
    this.activeStems.forEach((stem) => {
      if (this.playerState.stemsCollected.includes(stem.id)) return;
      const dx = this.playerState.x - stem.position3D[0];
      const dz = this.playerState.z - stem.position3D[2];
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < 3.2) {
        this.playerState.stemsCollected.push(stem.id);
        this.playerState.score += 250;
        beatAudio.playStemCollect();
        beatAudio.play808(50, 0.4);

        const mesh = this.stemMeshes.get(stem.id);
        if (mesh) {
          this.scene.remove(mesh);
        }
        this.onStemCollect(stem);
      }
    });

    // 3. Check Vinyl Coin Pickups
    this.vinylCoins.forEach((coin) => {
      if (coin.collected) return;
      const dx = this.playerState.x - coin.x;
      const dz = this.playerState.z - coin.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < 2.5) {
        coin.collected = true;
        this.playerState.coinsCollected += 1;
        this.playerState.score += 100;
        beatAudio.playSampleStab(587.33); // D5 chime
        this.scene.remove(coin.mesh);
      }
    });

    this.onStateChange({ ...this.playerState });
  }

  public dispose() {
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onWindowBlur);
    if (this.isSoftwareGl) {
      clearTimeout(this.frameId);
    } else {
      cancelAnimationFrame(this.frameId);
    }
    this.renderer.dispose();
  }
}
