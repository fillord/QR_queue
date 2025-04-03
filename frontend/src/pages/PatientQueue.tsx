import { useState } from "react"
import axios from "axios"

export default function PatientQueue() {
  const doctorId = 1
  const [position, setPosition] = useState<number | null>(null)

  const joinQueue = async () => {
    const res = await axios.post("http://localhost:8000/queue/join", {
      doctor_id: doctorId,
    })
    setPosition(res.data.id)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6">Электронная очередь</h1>
        {!position ? (
          <button
            onClick={joinQueue}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Встать в очередь
          </button>
        ) : (
          <p className="text-xl text-green-600 font-semibold">
            Вы записаны! Ваш номер: {position}
          </p>
        )}
      </div>
    </div>
  )
}
