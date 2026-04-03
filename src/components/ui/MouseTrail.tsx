"use client";

import { useEffect } from "react";

export default function MouseTrail() {

  useEffect(() => {

    const createSpark = (x:number,y:number) => {

      const spark = document.createElement("div")

      spark.className =
        "fixed w-2 h-2 rounded-full pointer-events-none z-50"

      spark.style.left = `${x}px`
      spark.style.top = `${y}px`

      spark.style.background =
        "radial-gradient(circle,#22D3EE 0%,#06B6D4 40%,transparent 70%)"

      spark.style.boxShadow =
        "0 0 10px #22D3EE,0 0 20px #06B6D4"

      spark.style.transition =
        "transform 0.5s ease-out,opacity 0.5s ease-out"

      document.body.appendChild(spark)

      requestAnimationFrame(()=>{
        spark.style.transform="scale(0)"
        spark.style.opacity="0"
      })

      setTimeout(()=>{
        spark.remove()
      },500)

    }

    const move=(e:MouseEvent)=>{
      createSpark(e.clientX,e.clientY)
    }

    window.addEventListener("mousemove",move)

    return ()=>window.removeEventListener("mousemove",move)

  },[])

  return null
}