// Generates a stable gradient + initials from a name
const GRADIENTS = [
  'linear-gradient(135deg, hsl(43 80% 42%), hsl(43 90% 62%))',   // gold warm
  'linear-gradient(135deg, hsl(217 80% 45%), hsl(217 90% 62%))', // blue
  'linear-gradient(135deg, hsl(142 60% 35%), hsl(142 70% 52%))', // emerald
  'linear-gradient(135deg, hsl(280 65% 45%), hsl(280 75% 62%))', // purple
  'linear-gradient(135deg, hsl(0 70% 45%), hsl(14 85% 58%))',    // red-orange
  'linear-gradient(135deg, hsl(195 75% 38%), hsl(195 85% 55%))', // teal
  'linear-gradient(135deg, hsl(330 65% 42%), hsl(330 75% 60%))', // rose
  'linear-gradient(135deg, hsl(25 80% 40%), hsl(35 90% 58%))',   // amber-brown
];

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function getAvatarGradient(name: string): string {
  return GRADIENTS[hashName(name) % GRADIENTS.length];
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}
