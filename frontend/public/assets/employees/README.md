# Employee Profile Photos

Place employee avatar photos in this directory using the following naming convention:

- `employee-<id>.jpg` (e.g. `employee-1.jpg`, `employee-2.jpg`, `employee-15.jpg`)

When an employee with matching ID exists, their photo will automatically be displayed across:
- Dashboard Recent Employees
- Employee Directory (Table & Grid views)
- Employee Details Profile
- Navigation Bars

If a photo is not found for an employee, the frontend gracefully falls back to their initials avatar with deterministic theme colors.
