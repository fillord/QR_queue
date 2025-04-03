import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function Login() {
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      const form = new FormData()
      form.append("username", name)
      form.append("password", password)

      const res = await axios.post("http://localhost:8000/login", form)
      localStorage.setItem("doctorId", res.data.doctor_id)
      navigate(`/doctor/${res.data.doctor_id}`)
    } catch {
      alert("Неверный логин или пароль")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Вход врача</h1>
        <input
          className="w-full p-2 mb-3 border rounded"
          placeholder="Логин"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="password"
          className="w-full p-2 mb-3 border rounded"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Войти
        </button>
      </div>
    </div>
  )
}
