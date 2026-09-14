import logo from '../assets/dong-tay-land-logo.png'
import './BrandLogo.css'

type BrandLogoProps = {
  height?: number
}

export default function BrandLogo({ height = 38 }: BrandLogoProps) {
  return (
    <div className="brand-logo-badge">
      <img src={logo} alt="Dong Tay Land" style={{ height }} />
    </div>
  )
}
