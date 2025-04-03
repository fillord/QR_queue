import { useEffect, useState } from "react"
import axios from "axios"

type QueueEntry = {
  id: number
  status: string
}

export default function DoctorDashboard() {
  const doctorId = 1
  const [queue, setQueue] = useState<QueueEntry[]>([])

  const fetchQueue = async () => {
    const res = await axios.get(`http://localhost:8000/queue/${doctorId}`)
    setQueue(res.data)
  }

  const callNext = async () => {
    await axios.post(`http://localhost:8000/queue/${doctorId}/next`)
    fetchQueue()
  }

  const skipPatient = async (id: number) => {
    await axios.patch(`http://localhost:8000/queue/${doctorId}/skip/${id}`)
    fetchQueue()
  }

  const resetQueue = async () => {
    await axios.post(`http://localhost:8000/queue/${doctorId}/reset`)
    fetchQueue()
  }

  useEffect(() => {
    fetchQueue()
    const interval = setInterval(fetchQueue, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Панель врача</h1>
        <div className="flex gap-4 mb-6 justify-center">
          <button
            onClick={callNext}
            className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
          >
            Вызвать следующего
          </button>
          <button
            onClick={resetQueue}
            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
          >
            Сбросить очередь
          </button>
        </div>

        <ul className="space-y-2">
          {queue.map((q) => (
            <li
              key={q.id}
              className="flex justify-between items-center border rounded-xl p-3 bg-gray-50"
            >
              <span>Пациент #{q.id}</span>
              <div className="flex items-center gap-3">
                <span className="capitalize text-sm text-gray-700">
                  {q.status}
                </span>
                {q.status === "waiting" && (
                  <button
                    onClick={() => skipPatient(q.id)}
                    className="px-3 py-1 text-sm bg-yellow-400 text-white rounded hover:bg-yellow-500"
                  >
                    Пропустить
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
