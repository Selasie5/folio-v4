import React from 'react'

const Footer = () => {
  return (
    <footer className=' bg-white flex justify-between items-center w-full px-10 py-1'>
      <div>
      <span className='uppercase text-sm text-gray-800'>© {new Date().getFullYear()} Selasie Sepenu. All rights reserved.</span>
      </div>
      {/* //Show the current time */}
{/* <div>
  <span className='non-mono'>{new Date().getHours()}:{new Date().getMinutes()} PM</span>
</div> */}
    </footer>
  )
}

export default Footer
