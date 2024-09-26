import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgFork = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1200 1200"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path d="M1196.6 363.84 911.57 127.5a9.53 9.53 0 0 0-10.129-1.29 9.53 9.53 0 0 0-5.473 8.618v146.01c-93.984 1.617-182.17 27.145-249.25 72.297-16.918 11.391-32.586 24.113-46.676 37.906-14.09-13.793-29.754-26.516-46.676-37.91-67.074-45.152-155.26-70.68-249.25-72.297l-.004-146a9.52 9.52 0 0 0-5.472-8.617 9.52 9.52 0 0 0-10.13 1.289L3.48 363.846a9.52 9.52 0 0 0-3.445 7.332 9.53 9.53 0 0 0 3.446 7.332l285.03 236.34a9.53 9.53 0 0 0 10.129 1.29 9.53 9.53 0 0 0 5.472-8.618v-145.78c77.191 2.351 208.32 33.383 208.32 138.86v464.58c0 5.258 4.266 9.523 9.524 9.523h156.16c5.258 0 9.523-4.265 9.523-9.523v-464.58c0-105.48 131.13-136.5 208.32-138.86v145.78a9.524 9.524 0 0 0 15.602 7.328l285.03-236.34a9.52 9.52 0 0 0 3.445-7.332 9.5 9.5 0 0 0-3.445-7.328z" />
  </svg>
)
export default SvgFork