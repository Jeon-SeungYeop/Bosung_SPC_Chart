import { useEffect, useState } from 'react'

const FullButton = () => {
    const [isFullScreen, setFullScreen] = useState(Boolean(document.fullscreenElement))

    const toggleFullScreen = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen()
        } else {
        document.documentElement.requestFullscreen()
        }

        setFullScreen((current) => !current)
    }

    useEffect(() => {
        const fullscreenchangeHandler = () => {
            setFullScreen(Boolean(document.fullscreenElement))
        }

    window.addEventListener('fullscreenchange', fullscreenchangeHandler)

    return () => window.removeEventListener('fullscreenchange', fullscreenchangeHandler)
    }, [])

    return (
        <button className='btn bg-[#F1F5F9] text-[#141412] btn-dark shadow-base2 font-normal btn-sm dark:bg-[#0F172A] dark:text-[#DFF6FF] dark:shadow-lg' onClick={() => toggleFullScreen()}>
            {isFullScreen ? 'Normal Screen' : 'Full Screen'}
        </button>
    )
}

export default FullButton