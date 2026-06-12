import { supabase } from './supabase'

// ── Courses ───────────────────────────────────────────────────────────────────

export async function getCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function createCourse(course) {
  const { data, error } = await supabase
    .from('courses')
    .insert([course])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCourse(id, updates) {
  const { data, error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCourse(id) {
  const { error } = await supabase.from('courses').delete().eq('id', id)
  if (error) throw error
}

// ── Students ──────────────────────────────────────────────────────────────────

export async function getStudents() {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function createStudent(student) {
  const { data, error } = await supabase
    .from('students')
    .insert([student])
    .select()
    .single()
  if (error) throw error
  // create a matching payment record (Unpaid by default)
  await supabase
    .from('student_payments')
    .insert([{ student_id: data.id, amount_paid: 0, status: 'Unpaid' }])
  return data
}

export async function updateStudent(id, updates) {
  const { data, error } = await supabase
    .from('students')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteStudent(id) {
  // cascade deletes student_payments too (FK ON DELETE CASCADE)
  const { error } = await supabase.from('students').delete().eq('id', id)
  if (error) throw error
}

// ── Expenses ──────────────────────────────────────────────────────────────────

export async function getExpenses() {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return data
}

export async function createExpense(expense) {
  const { data, error } = await supabase
    .from('expenses')
    .insert([expense])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateExpense(id, updates) {
  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteExpense(id) {
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) throw error
}

// ── Student Payments ──────────────────────────────────────────────────────────

export async function getStudentPayments() {
  const { data, error } = await supabase
    .from('student_payments')
    .select('*')
  if (error) throw error
  return data
}

// ── Leads ─────────────────────────────────────────────────────────────────────

export async function getLeads() {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createLead(lead) {
  const { data, error } = await supabase
    .from('leads')
    .insert([{ ...lead, updated_at: new Date().toISOString() }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateLead(id, updates) {
  const { data, error } = await supabase
    .from('leads')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteLead(id) {
  const { error } = await supabase.from('leads').delete().eq('id', id)
  if (error) throw error
}

// ── Lead Activities ───────────────────────────────────────────────────────────

export async function getLeadActivities(leadId) {
  const { data, error } = await supabase
    .from('lead_activities')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createLeadActivity(activity) {
  const { data, error } = await supabase
    .from('lead_activities')
    .insert([activity])
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Student Payments (continued) ──────────────────────────────────────────────

export async function recordPayment(paymentId, { amountToAdd, method, date, courseFee }) {
  // fetch current record first
  const { data: current, error: fetchErr } = await supabase
    .from('student_payments')
    .select('amount_paid')
    .eq('id', paymentId)
    .single()
  if (fetchErr) throw fetchErr

  const newPaid   = Number(current.amount_paid) + Number(amountToAdd)
  const newStatus = newPaid >= courseFee ? 'Paid' : 'Partial'

  const { data, error } = await supabase
    .from('student_payments')
    .update({ amount_paid: newPaid, status: newStatus, payment_date: date, method })
    .eq('id', paymentId)
    .select()
    .single()
  if (error) throw error
  return data
}
