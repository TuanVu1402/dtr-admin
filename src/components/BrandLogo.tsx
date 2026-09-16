import logo from '../assets/dong-tay-land-logo.png'

type BrandLogoProps = {
  height?: number
}

export default function BrandLogo({ height = 38 }: BrandLogoProps) {
  return (
    <div className="inline-flex items-center rounded-[10px] bg-[#fdf8ec] px-3.5 py-1.5">
      <img className="block w-auto" src={logo} alt="Dong Tay Land" style={{ height }} />
    </div>
  )
}
