import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getCourses } from '../lib/api'
import { setCoursesCache } from '../data/mockData'

const CoursesContext = createContext({ courses: [], reloadCourses: () => {} })

export function CoursesProvider({ children }) {
  const [courses, setCourses] = useState([])

  const load = useCallback(() => {
    getCourses()
      .then(data => {
        setCourses(data)
        setCoursesCache(data)
      })
      .catch(console.error)
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <CoursesContext.Provider value={{ courses, reloadCourses: load }}>
      {children}
    </CoursesContext.Provider>
  )
}

export function useCourses() {
  return useContext(CoursesContext).courses
}

export function useCoursesContext() {
  return useContext(CoursesContext)
}
