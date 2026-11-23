import InspectMode from '@/components/inspect/InspectMode'
import InspectToggle from '@/components/inspect/InspectToggle'
import WireframeMode from '@/components/wireframe/WireframeMode'

const Footer = () => {
  return (
    <footer className='mt-16 flex w-full items-center justify-between gap-4 bg-white pt-6 dark:bg-[#111111]'>
      <div>
      <span className='text-[11px] leading-5 uppercase text-gray-800 dark:text-neutral-400'>© {new Date().getFullYear()} Selasie Sepenu. All rights reserved.</span>
      </div>
      <InspectToggle />
      {/* The overlay renders into <body>; mounting it here keeps the root layout untouched. */}
      <InspectMode />
      {/* Hidden: no visible trigger, see components/wireframe. */}
      <WireframeMode />
      {/* //Show the current time */}
{/* <div>
  <span className='non-mono'>{new Date().getHours()}:{new Date().getMinutes()} PM</span>
</div> */}
    </footer>
  )
}

export default Footer
