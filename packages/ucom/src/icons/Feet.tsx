import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgFeet = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    data-name="Layer 1"
    viewBox="0 0 800 800"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d="m743.2 553.3-48 14.6h-76.8l-69.6-4.9-28.8-46.2-26.3-19.5-52.8-41.4-79.2-56-41.3-56 4.6-43.8-9.6-119.3 88.8-2.4h113.4l-7.2 85.1 16.8 70.6 40.8 58.4 117.6 68.2 38.4 14.6 36 63.3-16.9 14.6ZM328 417.1 445.6 512l38.4 17.1 36 63.3-8.6 14.6-56.2 14.6h-76.8l-67.2-7.2-244.9-51.2L40 551v-46.2l7.2-46.2 19.2-80.3 2.4-53.5-9.6-119.3L148 203h132.4l-10.1 90 16.8 65.7 40.9 58.5Z"
      className="feet_svg__cls-1"
    />
  </svg>
)
export default SvgFeet
