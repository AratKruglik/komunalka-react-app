import { createFileRoute } from '@tanstack/react-router'
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#333333] mb-4">
          Облік комунальних послуг
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Вітаємо у вашому застосунку для обліку показників лічільників!
        </p>

        <div className="bg-gray-50 rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-semibold text-[#333333] mb-4">
            Можливості:
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-[#10b981] rounded-full mt-2 mr-3"></span>
              <span className="text-gray-700">Управління адресами</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-[#10b981] rounded-full mt-2 mr-3"></span>
              <span className="text-gray-700">Додавання лічильників</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-[#10b981] rounded-full mt-2 mr-3"></span>
              <span className="text-gray-700">Внесення показників</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-[#10b981] rounded-full mt-2 mr-3"></span>
              <span className="text-gray-700">Перегляд статистики споживання</span>
            </li>
          </ul>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r">
          <p className="text-sm text-gray-600">
            💡 Почніть з додавання своєї першої адреси, щоб розпочати облік показників
          </p>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
