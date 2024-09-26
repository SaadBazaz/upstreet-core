import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgBodyAnger = ({
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
      <path id="bodyAnger_svg__a" d="M140.4 8.6h519.1v782.7H140.4z" />
    </defs>
    <path
      d="M594.5 352h-15.3c-5.3 6.7-16.6 16.9-24.9 20.1v-.8c5-12.7 23.3-78.9 20.9-87.6-11.7-59.9-38.5-119.4-55.4-160.5h-.8c-2.4 19.8-6.1 55.2-11.3 67.4-2.7 0-5.4-2.4-7.9-2.4-5.4-41.5-10.7-76.4-16.1-124.4-.3.5-.5 3.4-.8 1.6-7.2 16.6-15.3 33.2-17.2 49.8-15 20.9-28.6 38.3-43 55.4-5.4 11.7-8.6 15.6-15.6 19.3 1.7-33.4 7.2-66.8 10.8-100.4-.3.5-.5 1.1-.8 1.6-6.4 9.4-10 18.7-19.3 28.1-20 28.4-52.9 70.6-74.6 92.3-.3-34.3-.5-69.3-.8-103.6-.3.5-.5 1.1-.8 1.6-20.6 39.1-41.2 78.2-61.8 117.2-9.1 18.5-18.2 36.9-27.3 55.4 1.3 12.6 2.7 13.4 6.7 20.1 2.6 27.5 9.2 52.8 16.5 78.6h-.8c-.5-5.3-1.1-5.8-1.6-6.3-9.4-7.5-18.7-15-28.1-22.5h-14.4c-.3-19.5-.5-32.1-.8-58.6-9.6 4.6-19.3 9.1-28.9 13.6 3.9-30.7-1.6-95.2 1.6-108.4C210.8 84 269.7 28.4 370.6 14.8c28.7-3.9 66.3-2.8 91.5 4 26.9 7.3 51.3 17.8 71.4 32.1 51.3 33.3 77.7 86.3 89.9 153.4.3 34.3.5 73.6.8 102.8-9.9-4.5-13-9.1-29.7-13.6zM470.1 141.6c1.9 6.1 10.9 67.7 9.6 75.5-18.7 3.3-52 35.4-53 51.4 3.7 1.6 4.1 2.8 13.9 3.2 6.1-9.1 23.4-23.9 38.2-30.2 9-5.6 23.3-10.2 27.3-14.8-1.1-2.7-2.1-5.4-3.2-8 8.5-6.5 16.5-15.3 19.3-24.1h.8c7.6 24.5 19.3 55.6 23.3 78.7 2.4 8.6-25 113.1-35.3 128.4-10.4 13.4-31.1 29.3-46.5 33.8-9.8 6.9-50.1 37.9-65 34.5-22.7-5.1-94.5-57.5-105.1-75.5-10.5-11.6-14.5-40.5-20.9-61.8-3.5-11.5-7.6-49.1-9-57.6 9-27.8 22.7-54.6 35.5-79.7 3.8 2.4-.5 20.1 0 20.1-1.4.6-3 4.2-8 9.6 1.2 4.4 3 5.2 7.2 6.4v17.7c8.1-2.4 13.5-5.4 20.1-7.7 16.4 7.6 30 18.5 43.3 30.2 5.6-.4 7.9-2.4 10.4-5.6-4-19.2-20.5-31.5-35.3-40.1 1.3 2.3 5.2-3.2 4-4.8 15.9-11.6 29-30.3 40.1-38.8h.8c-3.2 17.2-6.4 39.6-9.6 62.1 38.2-24.6 73.7-62 97.1-102.9M297.6 253.2c-.8 2.9-1.6 5.9-2.4 8.8 2.8 3.2 3.6 3.4 11.2 8-8.4 9.9-10.5 19.2-4.8 33.7 19.3-2 37 0 49 4.8 4-3.6 7.1-8.5 8-16.9-.3-.8 9.2 2.1 6.8-4.8-20.4-11.3-42.9-27.2-67.8-33.6m200.6 0c-22.5 16.7-47.5 18.9-65 38.8v-2.6c1.1.9 6.3 2.8 6.3 2.8.3 5.6 6.4 15.8 8.2 16.4 5.8-2.1 15.3-5.3 21.7-5.6 9.1.3 18.2.5 27.3.8 5.2-12.7 3.2-24.7-4.8-32.9 2.2-.5 4.8-1.1 7.6-1.6-3.3-2.4 5.2-2.6 3.7-7.2-.5-2.7-1.1-1-1.6-8 3.4-.3-2.3-.6-3.4-.9m-123.6 84.4c1.6 3-3.4 3.8-4 8.8 21.1 24 43.9 23.8 65 0-.6-5-1.9-5.9-4-8.8h-4.8c-18.8 19.5-28.6 19.3-47.4 0zm26.5 35.3c-11.1 4.1-25.8.3-34.5 5.6-2.7 6.6-15.2 27.2-15.2 57 10.1 1.1 99.8-.8 102.7-4.8 5.8-11.2-10.4-47.5-16-55.4-12.4-.8-24.7-1.6-37-2.4m47.9 47.4c-31.9.3-59.2.5-86.5.8v-4c.5-2.7 1.1-5.4 2.8-8 6.3 3.8 13.8-1.1 21.3-1.6.5-2.9 1.1-5.9 3.8-8.8-2.4-.3-2.7-.5-3-.8-6.2.3-12.3.5-18.5.8 2.1-4.3 4.3-8.6 6.4-12.8 18.7-.3 37.5-.5 56.2-.8 1.9 4.3 3.7 8.6 5.6 12.9-10.7.3-21.4.5-32.1.8-.3 3.2 4.8 6.4 2.1 11.7h34.8c.9 1.7 1.7 8.1 7.1 9.8m-113.7 44.9c19.4 8 46.8 40.4 77.8 32.9 22.6-5.4 38.6-21.2 57-31.3v20.1c-28.9 16.8-55.4 48.1-30.5 86.7 12.2 7.9 14.3 14.9 26.2 16.9-13.1 59.3 22.7 55.3 38 93.1-.3.5-.5 1.1-.8 1.6-23.3 1.3-46.6 6.1-69.8 4-43.8 2.2-90.4.8-130-4 8.1-44.4 52.8-26.3 43.3-95.5 54.9-36 30-84.1-11.2-103.6zm-8.8 105.2c.3 12.9 7.3 20.1 13.4 30.5-5.3 29-37.3 48.1-40.7 50.6-2.4 7.2-4.8 14.5-7.2 21.7-13.8 35.2-24.7 71.1-33.7 112.4-32.8 12.6-77-15.8-86.7-36.1 7.2-11.2 14.4-22.5 21.7-33.7 13.7-22.3 32.7-68.2 37.7-88.3 6.5-26.1-20.4-71-16.9-97.2 7.5-8.9 47.6-41.4 57-45 8.8 2.1 17.7 4.3 26.5 6.4 30.4 10.7 95.8 38 41.7 79.5-4.3-.3-8.6-.5-12.8-.8m154.1 0c-.7.3-8.6.5-12.8.8-33.3-18.2-16.3-47.9 5.6-64.2 7.4-5.6 56.4-23.9 62.6-21.7 10.3 3.7 59.5 36.2 57 45.8 5.5 25.7-24.4 75.6-16.9 96.4 4.5 15.9 23.7 67.5 36.9 87.5 5.4 10.9 19.8 22.5 22.5 35.3-10.7 19.3-28.7 30.6-52 36.1-12.7 1.9-30.8 3.2-34.7 3.2-2.1-16-4.3-26.5-6.4-36.9l-22.5-69.9c2.3-10.4-8-20.9-9.7-31.3-6.2-5.5-27.9-14.1-34.5-36.9-4.7-16.6 4.8-27.2 4.9-44.2m-280.1-8.3c4.9 20.2 8.6 44.2 13.6 67-3.4 9.5-10.5 30.5-16.9 36.9-17-4-36.5-4.4-49.8-18.5-.7-51.5 26.9-71 53.1-85.4m406.9-.5c22.1 10.3 53.3 36.1 51.4 93-15.5-1-33.9 7-49.8 11.3-5.3-12.3-10.7-24.6-16-36.9 4.7-22.5 9.6-41.7 14.4-67.4"
      className="bodyAnger_svg__st1"
    />
  </svg>
)
export default SvgBodyAnger