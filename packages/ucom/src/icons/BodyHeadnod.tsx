import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgBodyHeadnod = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    viewBox="0 0 800 800"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <defs>
      <path id="bodyHeadnod_svg__a" d="M22.1 8.6h755.7v782.7H22.1z" />
    </defs>
    <path
      d="M614.7 397.3h-17.2c-3.7 6.8-19.8 16-28 20.8v-.9c5.6-14.3 25-89.6 23.5-97.4-4.8-44.9-41.5-126.8-62.4-182h-.9c-4.1 22.8-10 65.2-20.8 73.2h3.6c-10.5-46.6-16.6-93.3-22.6-140-.3.6-.6 6.1-.9 1.8-8.1 18.7-9.4 37.4-24.4 56-10.9 23.5-23.4 43.2-43.4 62.4-5.9 7.4-9.2 17.5-17.1 21.7 1.5-37.7 6.6-75.3 11.7-113l-.9 1.8c-7.2 10.5-10.8 21.1-21.7 31.6-22.5 31.9-59.1 80.2-84.1 103.1-.3-36.2-.6-77.1-.9-115.7l-.9 1.8-69.6 132c-10.2 20.8-20.5 41.6-30.7 62.4 1.5 15.4 3 19.6 7.8 27.1 3.6 29.7 11.1 55.7 18.5 80h-.9c-.6-2-1.2-2.6-1.8-3.2-10.5-8.4-21.1-16.9-31.6-23.5h-16.3c-.3-23.8.3-45.8 0-67.8-10.8 5.1-22.6 11.2-33.5 16.3 4.4-38.7-2.1-90.2 1.8-122.9 13.2-94.5 95.8-196.4 211.6-207 32.5-3 74.7-3.2 103.1 4.5 30.3 8.2 57.8 20 80.5 36.2 58.4 37.5 87.5 98.3 101.3 172.7.3 38.6.6 84.3.9 115.7-11.1-5.1-22.3-10.2-33.4-15.4-.3 21.9-.3 43.9-.3 67.7M475.4 157.8c2.5 9.7 11 80.5 11.8 95.8h-.9c-10.6-4.6-30.5-9-43.4-4.5-.8 5.3-.4 8.2.9 12.7 32.9 11.4 51.5 24.7 79.6 47 1.8-.9 3.6-1.8 5.4 1.7 14.6-18.4-15.3-42-31.6-51.4l1.8-2.7c16.6-7.5 26.9-27.4 34.4-38h.9c8.5 31.9 23 63.6 26.2 88.6 6.7 15.6-28.1 127.3-39.8 145.3-6.4 14.3-35.1 32.8-52.4 37.3-11.1 7.8-56.4 42.7-73.2 38.9-25.6-5.8-106.5-64.8-118.4-85-11.9-12.2-16.3-45.6-23.5-69.6-3.9-12.9-15.6-56.5-10-63.4 10-32.7 24.5-61 38.9-89.4h8.3c-6 17.5-7.7 35-8.3 52.4-4.1 6.9-24.5 12.6-9 35.3h3.6c12.7-9.6 24.4-19.8 38-28.9 10.6-6.2 33.7-15.1 42.3-19.9 1.3-4.3-.3-8.9-2.5-12.7h-21.7c11.4-5.1 10.2-10.2 15.4-15.4 9-11.1 18.1-22.3 27.1-25.7h.9c-3.6 17.5-7.2 42.9-10.8 68.2 42.8-27.6 84.3-71.4 110-116.6M314.5 303.3c-11.9 4.9-36.9 19.2-43.2 39.8h.7c53.6-4.5 70.8 2.9 94.3 14.4 6-6-.8-7.5-.2-8.1-.1-11.8-7.4-31.4-14.5-41.6-12.4 5.6-24.7-3-37.1-4.5m166.4-.9c-.7 7.7-29.1 10.9-36.2 8.1-3.6 10.7-15.7 27.9-9.9 47h.9c28.5-13 52.5-18.5 97.7-14.4-5.6-15.2-40.9-39.3-52.5-40.7m-109.4 85.9-4.5 5.4.9 4.5c10.2 21.9 57.3 17.6 67.8-.9-.7-5.3-2.2-5.8-4.5-9-13.6.6-18.8 11-34.4 8.1-9.8-1.8-13.8-7.6-25.3-8.1m-31.7 39.8c19 40.5 102.8 42.8 123 0h-3.6c-38.4 11.2-75.8 11.1-119.4 0M322.6 523c21.3 10.3 47.5 36.9 81.4 37.1 30.9.1 49.7-23.9 70.5-35.3-.3 39.7 2 60.6 38 73.2 9.3 2.7 20.5 5.7 29.8 7.2-18.1 2.1-56.1 13.4-53.3 21.7-32.9 45.5 31.3 123.8 47.9 140.1-57.6 5-146.3 22.6-216.1 5.4-18.2-3-45.3-1.9-63.3-7.2h1.8c7.8-8.7 19.9-14.6 30.9-29.8-6.2-3.3-5.9-2.7-5.6-10 4.2-3.6 8.4-7.2 12.7-10.8 22.8-33.2 24.2-56.2 15.4-89.5-10.5-4.8-21.1-9.6-31.6-14.5-8.7-2.5-19.2-.6-25.3-5.4 52.6-10.2 67.9-23.1 66.8-82.2m-151 22.6c42.4 3.8 23.8 55 14.5 72.3 1.3 2.3 1.5 7.6 3.6 4.5 9.8 5.6 25.4-2.1 38.9 0 23.2 3.7 44.4 14 62.4 18.9 15.6 21.9-32.4 91.4-54.2 112.1-39.7.3-63.8-20.6-98.6-9.9-17.8 15.4-28.5 32-53.3 46.1-26.9-13.4-36.3-35.1-60.6-58.8 12.1-16 55.4-47.9 73.2-59.7 8.1-4.2 16.3-8.4 31.7-12.7-4.9-6-2.5-12.1-.1-18.1 15.8-18.1 23-32.9 29.8-55.1 5.5-17.5-2.5-39.5 12.7-39.6m447.6 0c3.9 1.2 7.8 2.4 11.8 10.5 4.9 14.6 4.1 33.7 11.7 51 4.8 10.8 8.6 3.4 22.6 33.4 2.4 6 7.1 12.1 7.2 18.1 10.2 5.7 20.5 11.5 30.7 17.2 22.3 18.1 44.6 36.2 66.9 54.2v.9c-16.7 23.7-33.6 46.2-60.6 59.7-17.8-15.4-35.6-31.6-53.3-47-36.1-10.9-77.2 15.5-98.6 9-8.3-4-21.6-18.6-25.3-27.1-2.4-7.2-4.8-8.6-7.2-21.7-3.6 3.6-7.2-3.6-10.8-5.4-1.8-8.7-3.6-17.5-5.4-26.2-7.9-7.4-11.7-12.6-4.5-34.3 20.9-9.1 38-13.4 61.5-15.4 16.4 4.2 35.2 7.9 42.5-4.5-9.2-25.2-26.7-59.3 10.8-72.4"
      className="bodyHeadnod_svg__st1"
    />
  </svg>
)
export default SvgBodyHeadnod
