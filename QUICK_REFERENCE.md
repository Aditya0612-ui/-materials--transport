# 🚀 Quick Reference Card

## Import Components
```jsx
import { Button, InputField, Table, Modal, Card, Grid } from './components/ui';
```

## Common Patterns

### **Responsive Grid**
```jsx
<Grid cols={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap={6}>
  <Card>Content 1</Card>
  <Card>Content 2</Card>
</Grid>
```

### **Form with Validation**
```jsx
<InputField
  label="Name"
  name="name"
  value={formData.name}
  onChange={handleChange}
  error={errors.name}
  icon={<i className="bx bx-user"></i>}
  required
/>
```

### **Data Table**
```jsx
<Table
  columns={[
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status', hidden: true }
  ]}
  data={items}
  striped
  hover
/>
```

### **Modal Form**
```jsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Add Item"
  footer={
    <ModalFooter
      onCancel={() => setIsOpen(false)}
      onConfirm={handleSubmit}
      loading={isSubmitting}
    />
  }
>
  <form>...</form>
</Modal>
```

### **Stats Dashboard**
```jsx
<Grid cols={{ xs: 1, sm: 2, lg: 4 }} gap={6}>
  <StatsCard
    title="Total Orders"
    value="1,234"
    icon="bx bx-shopping-bag"
    trend="up"
    trendValue="+12.5%"
    color="success"
  />
</Grid>
```

## Responsive Breakpoints
- **xs**: 320px (mobile)
- **sm**: 576px (large mobile)
- **md**: 768px (tablet)
- **lg**: 992px (laptop)
- **xl**: 1200px (desktop)
- **2xl**: 1400px (large desktop)

## Button Variants
`primary` `secondary` `success` `danger` `warning` `outline` `ghost` `link`

## Card Variants
`default` `gradient` `glass` `outlined` `elevated`

## Sidebar Behavior
- **< 992px**: Overlay mode (hidden by default)
- **≥ 992px**: Fixed mode (visible by default)

## Touch Targets
All interactive elements: **minimum 44px × 44px**

## Files Location
- Components: `/src/components/ui/`
- Config: `tailwind.config.js`, `postcss.config.js`
- Styles: `/src/index.css`, `/src/styles/dashboard.css`
- Demo: `/src/pages/ComponentsDemo.jsx`
- Docs: `UI_COMPONENTS_GUIDE.md`
