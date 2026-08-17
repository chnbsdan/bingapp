export type Market =
  | 'de-DE'
  | 'en-CA'
  | 'en-GB'
  | 'en-IN'
  | 'en-US'
  | 'fr-FR'
  | 'it-IT'
  | 'ja-JP'
  | 'zh-CN'
  | 'pt-BR'   // ★★★ 新增：巴西葡萄牙语
  | 'es-ES'   // ★★★ 新增：西班牙语
  | 'en-XA'   // ★★★ 新增：世界其他地区

interface MarketConfig {
  lang: Market
  flag: string
  name: string
  offset: number
  title: string
  keywords: string
  description: string
  startDate: string
}

export const markets: MarketConfig[] = [
  // ... 您现有的 9 个地区保持不变 ...
  {
    lang: 'de-DE',
    flag: '🇩🇪',
    name: 'Deutsch',
    offset: +2 * 60,
    title: 'Bing-Hintergrundbild',
    description: 'Entdecken Sie die Welt Foto für Foto',
    keywords: 'Tapete, Tapete herunterladen, Kostenlose Tapete herunterladen, Bing Tapete, Bing Tapete herunterladen, Kostenlose Bing Tapete herunterladen, 4k Tapete, 4k Tapete herunterladen, Kostenlose 4k Tapete herunterladen, HD Tapete, HD Tapete herunterladen, Kostenlose HD Tapete herunterladen',
    startDate: '2022-04-28 00:00:00',
  },
  {
    lang: 'en-CA',
    flag: '🇨🇦',
    name: 'English (Canada)',
    offset: -4 * 60,
    title: 'Bing Wallpaper',
    description: 'Explore the world one photo at a time',
    keywords: 'Wallpaper, Wallpaper Download, Free Wallpaper Download, Bing Wallpaper, Bing Wallpaper Download, Free Bing Wallpaper Download, 4k Wallpaper, 4k Wallpaper Download, Free 4k Wallpaper Download, HD Wallpaper, HD Wallpaper Download, Free HD Wallpaper Download',
    startDate: '2022-04-29 00:00:00',
  },
  {
    lang: 'en-GB',
    flag: '🇬🇧',
    name: 'English (UK)',
    offset: +1 * 60,
    title: 'Bing Wallpaper',
    description: 'Explore the world one photo at a time',
    keywords: 'Wallpaper, Wallpaper Download, Free Wallpaper Download, Bing Wallpaper, Bing Wallpaper Download, Free Bing Wallpaper Download, 4k Wallpaper, 4k Wallpaper Download, Free 4k Wallpaper Download, HD Wallpaper, HD Wallpaper Download, Free HD Wallpaper Download',
    startDate: '2022-04-28 00:00:00',
  },
  {
    lang: 'en-IN',
    flag: '🇮🇳',
    name: 'English (India)',
    offset: +5 * 60,
    title: 'Bing Wallpaper',
    description: 'Explore the world one photo at a time',
    keywords: 'Wallpaper, Wallpaper Download, Free Wallpaper Download, Bing Wallpaper, Bing Wallpaper Download, Free Bing Wallpaper Download, 4k Wallpaper, 4k Wallpaper Download, Free 4k Wallpaper Download, HD Wallpaper, HD Wallpaper Download, Free HD Wallpaper Download',
    startDate: '2022-04-28 00:00:00',
  },
  {
    lang: 'en-US',
    flag: '🇺🇸',
    name: 'English (US)',
    offset: -4 * 60,
    title: 'Bing Wallpaper',
    description: 'Explore the world one photo at a time',
    keywords: 'Wallpaper, Wallpaper Download, Free Wallpaper Download, Bing Wallpaper, Bing Wallpaper Download, Free Bing Wallpaper Download, 4k Wallpaper, 4k Wallpaper Download, Free 4k Wallpaper Download, HD Wallpaper, HD Wallpaper Download, Free HD Wallpaper Download',
    startDate: '2019-03-09 00:00:00',
  },
  {
    lang: 'fr-FR',
    flag: '🇫🇷',
    name: 'Francais',
    offset: +2 * 60,
    title: 'Fond d\'écran Bing',
    description: 'Explorez le monde une photo à la fois',
    keywords: 'Fond d\'écran, Télécharger fond d\'écran, Télécharger fond d\'écran gratuit, Fond d\'écran Bing, Télécharger fond d\'écran Bing, Télécharger fond d\'écran Bing gratuit, Fond d\'écran 4k, Télécharger fond d\'écran 4k, Télécharger fond d\'écran 4k gratuit, Fond d\'écran HD, Télécharger fond d\'écran HD, Télécharger fond d\'écran HD gratuit',
    startDate: '2022-04-28 00:00:00',
  },
  {
    lang: 'it-IT',
    flag: '🇮🇹',
    name: 'Italian',
    offset: +2 * 60,
    title: 'Sfondo Bing',
    description: 'Esplora il mondo una foto alla volta',
    keywords: 'Sfondo, Scarica sfondo, Scarica sfondo gratuito, Sfondo Bing, Scarica sfondo Bing, Scarica sfondo Bing gratuito, Sfondo 4k, Scarica sfondo 4k, Scarica sfondo 4k gratuito, Sfondo HD, Scarica sfondo HD, Scarica sfondo HD gratuito',
    startDate: '2022-04-28 00:00:00',
  },
  {
    lang: 'ja-JP',
    flag: '🇯🇵',
    name: '日本語',
    offset: +9 * 60,
    title: 'Bingの壁紙',
    description: '写真を一枚ずつ世界を探検する',
    keywords: '壁紙 (Kabe-mono), 壁紙のダウンロード (Kabe-mono no daunrōdo), 壁紙の無料ダウンロード (Kabe-mono no muryō daunrōdo), Bingの壁紙 (Bing no kabe-mono), Bingの壁紙のダウンロード (Bing no kabe-mono no daunrōdo), Bingの壁紙の無料ダウンロード (Bing no kabe-mono no muryō daunrōdo), 4k壁紙 (4k kabe-mono), 4k壁紙のダウンロード (4k kabe-mono no daunrōdo), 4k壁紙の無料ダウンロード (4k kabe-mono no muryō daunrōdo), 高解像度の壁紙 (Kōkaizōdo no kabe-mono), 高解像度の壁紙のダウンロード (Kōkaizōdo no kabe-mono no daunrōdo), 高解像度の壁紙の無料ダウンロード (Kōkaizōdo no kabe-mono no muryō daunrōdo)',
    startDate: '2022-04-28 00:00:00',
  },
  {
    lang: 'zh-CN',
    flag: '🇨🇳',
    name: '简体中文',
    offset: +8 * 60,
    title: '必应壁纸',
    description: '每日一图，带你领略世界之美',
    keywords: '壁纸, 壁纸下载, 壁纸免费下载, 必应壁纸, 必应壁纸下载, 必应壁纸免费下载, 4k 壁纸, 4k 壁纸下载, 4k 壁纸免费下载, 高清壁纸, 高清壁纸下载, 高清壁纸免费下载',
    startDate: '2010-01-01 00:00:00',
  },
  // ★★★ 新增：BR - 巴西葡萄牙语
  {
    lang: 'pt-BR',
    flag: '🇧🇷',
    name: 'Português (Brasil)',
    offset: -3 * 60,
    title: 'Papel de parede Bing',
    description: 'Explore o mundo uma foto de cada vez',
    keywords: 'Papel de parede, Baixar papel de parede, Baixar papel de parede grátis, Papel de parede Bing, Baixar papel de parede Bing, Baixar papel de parede Bing grátis, Papel de parede 4k, Baixar papel de parede 4k, Baixar papel de parede 4k grátis, Papel de parede HD, Baixar papel de parede HD, Baixar papel de parede HD grátis',
    startDate: '2022-04-28 00:00:00',
  },
  // ★★★ 新增：ES - 西班牙语
  {
    lang: 'es-ES',
    flag: '🇪🇸',
    name: 'Español',
    offset: +1 * 60,
    title: 'Fondo de pantalla Bing',
    description: 'Explora el mundo una foto a la vez',
    keywords: 'Fondo de pantalla, Descargar fondo de pantalla, Descargar fondo de pantalla gratis, Fondo de pantalla Bing, Descargar fondo de pantalla Bing, Descargar fondo de pantalla Bing gratis, Fondo de pantalla 4k, Descargar fondo de pantalla 4k, Descargar fondo de pantalla 4k gratis, Fondo de pantalla HD, Descargar fondo de pantalla HD, Descargar fondo de pantalla HD gratis',
    startDate: '2022-04-28 00:00:00',
  },
  // ★★★ 新增：ROW - 世界其他地区（英语）
  {
    lang: 'en-XA',
    flag: '🌍',
    name: 'English (ROW)',
    offset: 0,
    title: 'Bing Wallpaper',
    description: 'Explore the world one photo at a time',
    keywords: 'Wallpaper, Wallpaper Download, Free Wallpaper Download, Bing Wallpaper, Bing Wallpaper Download, Free Bing Wallpaper Download, 4k Wallpaper, 4k Wallpaper Download, Free 4k Wallpaper Download, HD Wallpaper, HD Wallpaper Download, Free HD Wallpaper Download',
    startDate: '2022-04-28 00:00:00',
  },
]

export const allMkt: string[] = markets.map(m => m.lang)

export const defaultMarket = markets.find(m => m.lang === 'en-US')!
