export interface Medicine {
    id: number;
    name: string;
    medicine_id: string;
    group: number;
    group_detail?: MedicineGroup;
    supplier: number;
    supplier_detail?: Supplier;
    stock_quantity: number;
    min_stock_alert: number;
    is_low_stock: boolean;
    composition: string;
    manufacturer: string;
    consumption_type: string;
    expiration_date: string;
    description: string;
    dosage_info: string;
    active_ingredients: string;
    side_effects: string;
    pharmaceutical_form: string;
    purchase_price: string;
    selling_price: string;
    profit_margin: number;
    image?: string;
    created_at: string;
    updated_at: string;
}

export interface MedicineGroup {
    id: number;
    name: string;
    description: string;
    medicines_count: number;
    created_at: string;
    updated_at: string;
}

export interface Supplier {
    id: number;
    name: string;
    phone: string;
    email: string;
    address: string;
    medicines_count: number;
    created_at: string;
    updated_at: string;
}

export interface Client {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    gender: 'M' | 'F';
    birth_date: string;
    phone: string;
    email: string;
    address: string;
    purchases_count: number;
    created_at: string;
    updated_at: string;
}

export interface Sale {
    id: number;
    sale_number: string;
    client: number;
    client_name: string;
    total_amount: string;
    payment_method: 'cash' | 'card' | 'mobile' | 'check';
    notes: string;
    sold_by: number;
    sold_by_name: string;
    items: SaleItem[];
    created_at: string;
}

export interface SaleItem {
    id: number;
    medicine: number;
    medicine_name: string;
    quantity: number;
    unit_price: string;
    total_price: string;
}

export interface DashboardStats {
    total_medicines: number;
    low_stock_count: number;
    total_revenue: string;
    total_sales: number;
    total_clients: number;
    total_suppliers: number;
    total_groups: number;
}