// Gradientes disponibles para las comunidades
const gradients = [
  "from-green-500 to-emerald-600",
  "from-blue-500 to-cyan-600",
  "from-purple-500 to-pink-600",
  "from-orange-500 to-red-600",
  "from-teal-500 to-blue-600",
  "from-indigo-500 to-purple-600",
  "from-red-500 to-pink-600",
  "from-yellow-500 to-orange-600",
];

// Función para obtener gradiente basado en el ID de la comunidad
export function getCommunityGradient(communityId: string): string {
  const index = communityId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
  return gradients[index] ?? "";
}
