export type DestinationId =
  | 'origin'
  | 'observatory'
  | 'library'
  | 'gallery'
  | 'comms'
  | 'blackhole'
  | 'frost'
  | 'crystal'
  | 'quantum';

export type ExperiencePhase = 'boot' | 'title' | 'travelling' | 'exploring';

export type QualityTier = 'low' | 'medium' | 'high';

export type QualityPreference = QualityTier | 'auto';

export type Vec3 = readonly [number, number, number];

export interface RingConfig {
  readonly innerRadius: number;
  readonly outerRadius: number;
  readonly tilt: number;
  readonly opacity: number;
  readonly color: string;
}

export interface MoonConfig {
  readonly radius: number;
  readonly distance: number;
  readonly speed: number;
  readonly inclination: number;
  readonly color: string;
}

export interface Destination {
  readonly id: DestinationId;
  readonly name: string;
  readonly designation: string;
  readonly role: string;
  readonly position: Vec3;
  readonly radius: number;
  readonly orbitRadius: number;
  readonly orbitSpeed: number;
  readonly rotationSpeed: number;
  readonly surface: readonly [string, string, string];
  readonly atmosphere: string;
  readonly emissive: number;
  readonly cloudOpacity: number;
  readonly hidden: boolean;
  /**
   * Hidden bodies become selectable once this discovery is logged. The anomaly
   * uses its own rule instead and leaves this undefined.
   */
  readonly unlockedBy?: DiscoveryId;
  readonly rings: readonly RingConfig[];
  readonly moons: readonly MoonConfig[];
  readonly tagline: string;
  readonly ambience: string;
}

export type SpaceWeatherKind =
  | 'meteor-shower'
  | 'solar-flare'
  | 'aurora-burst'
  | 'alien-signal';

export interface SpaceWeatherEvent {
  readonly kind: SpaceWeatherKind;
  readonly title: string;
  readonly description: string;
  readonly durationSeconds: number;
}

export interface LoreFragment {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  /** Fragment stays sealed in the journal until this discovery is logged. */
  readonly unlockedBy: DiscoveryId;
}

export type DiscoveryId =
  | 'first-contact'
  | 'constellation'
  | 'satellite-signal'
  | 'deep-space'
  | 'asteroid-relic'
  | 'code-galaxy'
  | 'code-warp'
  | 'code-archive'
  | 'idle-whale'
  | 'moon-tap';

export interface Discovery {
  readonly id: DiscoveryId;
  readonly title: string;
  readonly description: string;
}

export interface Achievement {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly isEarned: (state: AchievementContext) => boolean;
}

export interface AchievementContext {
  readonly visited: readonly DestinationId[];
  readonly discoveries: readonly DiscoveryId[];
  readonly blackHoleUnlocked: boolean;
}

export type TextScale = 'standard' | 'large' | 'largest';

export interface GraphicsSettings {
  readonly quality: QualityPreference;
  readonly textScale: TextScale;
  readonly bloom: boolean;
  readonly motionBlur: boolean;
  readonly reduceMotion: boolean;
  readonly music: boolean;
  readonly sfx: boolean;
}

export interface ProjectRecord {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly detail: string;
  readonly year: string;
  readonly stack: readonly string[];
}

export interface GalleryRecord {
  readonly id: string;
  readonly title: string;
  readonly caption: string;
  readonly palette: readonly [string, string];
}
