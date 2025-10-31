import ProjectList from '@/features/projects/ProjectList'
export default function Dashboard() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Your Projects</h1>
      <ProjectList />
    </div>
  )
}
