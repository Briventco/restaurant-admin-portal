
class StaffApi {
  baseURL = '/staff';

  async listByRestaurant(restaurantId, params = {}) {
    try {
      const mockStaff = this.getMockStaff(restaurantId);
      let filtered = mockStaff.filter(staff => staff.restaurantId === restaurantId);
      
      if (params.role) {
        filtered = filtered.filter(staff => staff.role === params.role);
      }
      
      if (params.status) {
        filtered = filtered.filter(staff => staff.status === params.status);
      }
      
      const sortField = params.sort || 'name';
      const sortOrder = params.order || 'asc';
      filtered.sort((a, b) => {
        if (sortOrder === 'asc') {
          return a[sortField] > b[sortField] ? 1 : -1;
        }
        return a[sortField] < b[sortField] ? 1 : -1;
      });
      
      const page = parseInt(params.page) || 1;
      const limit = parseInt(params.limit) || 20;
      const start = (page - 1) * limit;
      const paginated = filtered.slice(start, start + limit);
      
      return {
        staff: paginated,
        pagination: {
          page,
          limit,
          total: filtered.length,
          pages: Math.ceil(filtered.length / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching staff:', error);
      throw error;
    }
  }

  async getById(restaurantId, staffId) {
    try {
      const staff = this.getMockStaff(restaurantId);
      const member = staff.find(s => s.id === staffId && s.restaurantId === restaurantId);
      if (!member) {
        throw new Error('Staff member not found');
      }
      return member;
    } catch (error) {
      console.error('Error fetching staff member:', error);
      throw error;
    }
  }

  async create(restaurantId, staffData) {
    try {
      const newStaff = {
        id: `stf_${Date.now()}`,
        restaurantId,
        ...staffData,
        status: staffData.status || 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };
      
      const existingStaff = this.getAllStoredStaff();
      existingStaff.push(newStaff);
      localStorage.setItem('staff', JSON.stringify(existingStaff));
      
      return newStaff;
    } catch (error) {
      console.error('Error creating staff member:', error);
      throw error;
    }
  }

  async update(restaurantId, staffId, updateData) {
    try {
      const staff = this.getAllStoredStaff();
      const index = staff.findIndex(s => s.id === staffId && s.restaurantId === restaurantId);
      
      if (index === -1) {
        throw new Error('Staff member not found');
      }
      
      staff[index] = {
        ...staff[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('staff', JSON.stringify(staff));
      return staff[index];
    } catch (error) {
      console.error('Error updating staff member:', error);
      throw error;
    }
  }

  async delete(restaurantId, staffId) {
    try {
      const staff = this.getAllStoredStaff();
      const filtered = staff.filter(s => !(s.id === staffId && s.restaurantId === restaurantId));
      localStorage.setItem('staff', JSON.stringify(filtered));
      return { message: 'Staff member deleted successfully' };
    } catch (error) {
      console.error('Error deleting staff member:', error);
      throw error;
    }
  }

  async updateStatus(restaurantId, staffId, status) {
    try {
      const staff = this.getAllStoredStaff();
      const index = staff.findIndex(s => s.id === staffId && s.restaurantId === restaurantId);
      
      if (index === -1) {
        throw new Error('Staff member not found');
      }
      
      staff[index].status = status;
      staff[index].updatedAt = new Date().toISOString();
      staff[index].lastActivity = new Date().toISOString();
      
      localStorage.setItem('staff', JSON.stringify(staff));
      return staff[index];
    } catch (error) {
      console.error('Error updating staff status:', error);
      throw error;
    }
  }

  async assignRole(restaurantId, staffId, role, permissions = []) {
    try {
      const staff = this.getAllStoredStaff();
      const index = staff.findIndex(s => s.id === staffId && s.restaurantId === restaurantId);
      
      if (index === -1) {
        throw new Error('Staff member not found');
      }
      
      staff[index].role = role;
      staff[index].permissions = permissions;
      staff[index].updatedAt = new Date().toISOString();
      
      localStorage.setItem('staff', JSON.stringify(staff));
      return staff[index];
    } catch (error) {
      console.error('Error assigning role:', error);
      throw error;
    }
  }

  async getRoles(restaurantId) {
    try {
      const staff = this.getMockStaff(restaurantId);
      const roles = [...new Set(staff.map(s => s.role))];
      return roles;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  }

  async getPermissions(restaurantId, role) {
    try {
      const rolePermissions = {
        admin: ['view', 'create', 'edit', 'delete', 'manage_staff', 'manage_inventory', 'view_reports'],
        manager: ['view', 'create', 'edit', 'delete', 'manage_staff', 'view_reports'],
        chef: ['view', 'update_order_status', 'manage_inventory'],
        cashier: ['view', 'process_payment', 'create_order'],
        delivery: ['view', 'update_delivery_status'],
        waiter: ['view', 'create_order', 'update_order_status']
      };
      
      return rolePermissions[role] || [];
    } catch (error) {
      console.error('Error fetching permissions:', error);
      throw error;
    }
  }

  async getStaffStats(restaurantId) {
    try {
      const staff = this.getMockStaff(restaurantId);
      const total = staff.length;
      const active = staff.filter(s => s.status === 'active').length;
      const inactive = staff.filter(s => s.status === 'inactive').length;
      const onLeave = staff.filter(s => s.status === 'on_leave').length;
      
      const roles = {};
      staff.forEach(s => {
        if (!roles[s.role]) {
          roles[s.role] = 0;
        }
        roles[s.role]++;
      });
      
      return {
        total,
        active,
        inactive,
        onLeave,
        roles
      };
    } catch (error) {
      console.error('Error fetching staff stats:', error);
      throw error;
    }
  }

  async getCurrentShift(restaurantId) {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      let shift = 'day';
      
      if (currentHour >= 22 || currentHour < 6) {
        shift = 'night';
      } else if (currentHour >= 6 && currentHour < 14) {
        shift = 'morning';
      } else if (currentHour >= 14 && currentHour < 22) {
        shift = 'evening';
      }
      
      const staff = this.getMockStaff(restaurantId);
      const onDuty = staff.filter(s => 
        s.status === 'active' && 
        s.shift === shift
      );
      
      return {
        shift,
        onDuty: onDuty.length,
        staff: onDuty
      };
    } catch (error) {
      console.error('Error fetching current shift:', error);
      throw error;
    }
  }

  async clockIn(restaurantId, staffId, location) {
    try {
      const staff = this.getAllStoredStaff();
      const index = staff.findIndex(s => s.id === staffId && s.restaurantId === restaurantId);
      
      if (index === -1) {
        throw new Error('Staff member not found');
      }
      
      const clockRecord = {
        id: `clock_${Date.now()}`,
        staffId,
        staffName: staff[index].name,
        type: 'clock_in',
        time: new Date().toISOString(),
        location,
        date: new Date().toISOString().split('T')[0]
      };
      
      const clockHistory = this.getAllStoredClockHistory();
      clockHistory.push(clockRecord);
      localStorage.setItem('clockHistory', JSON.stringify(clockHistory));
      
      staff[index].clockedIn = true;
      staff[index].lastClockIn = clockRecord.time;
      staff[index].updatedAt = new Date().toISOString();
      
      localStorage.setItem('staff', JSON.stringify(staff));
      
      return clockRecord;
    } catch (error) {
      console.error('Error clocking in:', error);
      throw error;
    }
  }

  async clockOut(restaurantId, staffId, location) {
    try {
      const staff = this.getAllStoredStaff();
      const index = staff.findIndex(s => s.id === staffId && s.restaurantId === restaurantId);
      
      if (index === -1) {
        throw new Error('Staff member not found');
      }
      
      const clockRecord = {
        id: `clock_${Date.now()}`,
        staffId,
        staffName: staff[index].name,
        type: 'clock_out',
        time: new Date().toISOString(),
        location,
        date: new Date().toISOString().split('T')[0]
      };
      
      const clockHistory = this.getAllStoredClockHistory();
      clockHistory.push(clockRecord);
      localStorage.setItem('clockHistory', JSON.stringify(clockHistory));
      
      staff[index].clockedIn = false;
      staff[index].lastClockOut = clockRecord.time;
      staff[index].updatedAt = new Date().toISOString();
      
      localStorage.setItem('staff', JSON.stringify(staff));
      
      return clockRecord;
    } catch (error) {
      console.error('Error clocking out:', error);
      throw error;
    }
  }

  async getClockHistory(restaurantId, staffId, params = {}) {
    try {
      const clockHistory = this.getAllStoredClockHistory();
      let filtered = clockHistory.filter(c => c.staffId === staffId);
      
      if (params.startDate && params.endDate) {
        filtered = filtered.filter(c => {
          const date = c.date;
          return date >= params.startDate && date <= params.endDate;
        });
      }
      
      return filtered;
    } catch (error) {
      console.error('Error fetching clock history:', error);
      throw error;
    }
  }

  async getAttendance(restaurantId, date) {
    try {
      const staff = this.getMockStaff(restaurantId);
      const clockHistory = this.getAllStoredClockHistory();
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      const attendance = staff.map(member => {
        const clockIn = clockHistory.find(c => 
          c.staffId === member.id && 
          c.type === 'clock_in' && 
          c.date === targetDate
        );
        const clockOut = clockHistory.find(c => 
          c.staffId === member.id && 
          c.type === 'clock_out' && 
          c.date === targetDate
        );
        
        return {
          ...member,
          clockedIn: !!clockIn,
          clockedOut: !!clockOut,
          clockInTime: clockIn?.time,
          clockOutTime: clockOut?.time
        };
      });
      
      return {
        date: targetDate,
        attendance
      };
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }
  }

  getAllStoredStaff() {
    const stored = localStorage.getItem('staff');
    if (stored) {
      return JSON.parse(stored);
    }
    const initialStaff = this.getInitialStaff();
    localStorage.setItem('staff', JSON.stringify(initialStaff));
    return initialStaff;
  }

  getAllStoredClockHistory() {
    const stored = localStorage.getItem('clockHistory');
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  }

  getInitialStaff() {
    return [
      {
        id: 'stf_001',
        restaurantId: 'rst_001',
        name: 'Oluwaseun Adebayo',
        email: 'seun@amalasky.com',
        phone: '+234 801 111 1111',
        role: 'manager',
        status: 'active',
        shift: 'morning',
        permissions: ['view', 'create', 'edit', 'delete', 'manage_staff', 'view_reports'],
        clockedIn: true,
        lastClockIn: '2026-03-30T08:00:00Z',
        lastActivity: '2026-03-30T10:30:00Z',
        joinedDate: '2026-01-15T00:00:00Z',
        createdAt: '2026-01-15T00:00:00Z',
        updatedAt: '2026-03-30T10:30:00Z'
      },
      {
        id: 'stf_002',
        restaurantId: 'rst_001',
        name: 'Adebayo Ogunlesi',
        email: 'ayo@amalasky.com',
        phone: '+234 802 222 2222',
        role: 'chef',
        status: 'active',
        shift: 'morning',
        permissions: ['view', 'update_order_status', 'manage_inventory'],
        clockedIn: true,
        lastClockIn: '2026-03-30T07:30:00Z',
        lastActivity: '2026-03-30T11:00:00Z',
        joinedDate: '2026-02-01T00:00:00Z',
        createdAt: '2026-02-01T00:00:00Z',
        updatedAt: '2026-03-30T11:00:00Z'
      },
      {
        id: 'stf_003',
        restaurantId: 'rst_002',
        name: 'Funke Adetokunbo',
        email: 'funke@bukarepublic.com',
        phone: '+234 803 333 3333',
        role: 'manager',
        status: 'active',
        shift: 'evening',
        permissions: ['view', 'create', 'edit', 'delete', 'manage_staff', 'view_reports'],
        clockedIn: false,
        lastClockOut: '2026-03-29T22:00:00Z',
        lastActivity: '2026-03-29T22:00:00Z',
        joinedDate: '2026-01-20T00:00:00Z',
        createdAt: '2026-01-20T00:00:00Z',
        updatedAt: '2026-03-29T22:00:00Z'
      },
      {
        id: 'stf_004',
        restaurantId: 'rst_002',
        name: 'Chidi Nnamdi',
        email: 'chidi@bukarepublic.com',
        phone: '+234 804 444 4444',
        role: 'cashier',
        status: 'active',
        shift: 'evening',
        permissions: ['view', 'process_payment', 'create_order'],
        clockedIn: false,
        lastClockOut: '2026-03-29T22:00:00Z',
        lastActivity: '2026-03-29T22:00:00Z',
        joinedDate: '2026-02-10T00:00:00Z',
        createdAt: '2026-02-10T00:00:00Z',
        updatedAt: '2026-03-29T22:00:00Z'
      },
      {
        id: 'stf_005',
        restaurantId: 'rst_003',
        name: 'Grace Okonkwo',
        email: 'grace@jollofheaven.com',
        phone: '+234 805 555 5555',
        role: 'manager',
        status: 'active',
        shift: 'morning',
        permissions: ['view', 'create', 'edit', 'delete', 'manage_staff', 'view_reports'],
        clockedIn: true,
        lastClockIn: '2026-03-30T08:30:00Z',
        lastActivity: '2026-03-30T11:30:00Z',
        joinedDate: '2026-01-25T00:00:00Z',
        createdAt: '2026-01-25T00:00:00Z',
        updatedAt: '2026-03-30T11:30:00Z'
      },
      {
        id: 'stf_006',
        restaurantId: 'rst_003',
        name: 'Emeka Nwosu',
        email: 'emeka@jollofheaven.com',
        phone: '+234 806 666 6666',
        role: 'chef',
        status: 'active',
        shift: 'morning',
        permissions: ['view', 'update_order_status', 'manage_inventory'],
        clockedIn: true,
        lastClockIn: '2026-03-30T07:00:00Z',
        lastActivity: '2026-03-30T10:45:00Z',
        joinedDate: '2026-02-05T00:00:00Z',
        createdAt: '2026-02-05T00:00:00Z',
        updatedAt: '2026-03-30T10:45:00Z'
      },
      {
        id: 'stf_007',
        restaurantId: 'rst_004',
        name: 'John Samuel',
        email: 'john@mamaput.com',
        phone: '+234 807 777 7777',
        role: 'manager',
        status: 'active',
        shift: 'morning',
        permissions: ['view', 'create', 'edit', 'delete', 'manage_staff', 'view_reports'],
        clockedIn: true,
        lastClockIn: '2026-03-30T08:00:00Z',
        lastActivity: '2026-03-30T10:15:00Z',
        joinedDate: '2026-01-10T00:00:00Z',
        createdAt: '2026-01-10T00:00:00Z',
        updatedAt: '2026-03-30T10:15:00Z'
      },
      {
        id: 'stf_008',
        restaurantId: 'rst_004',
        name: 'Sarah Williams',
        email: 'sarah@mamaput.com',
        phone: '+234 808 888 8888',
        role: 'cashier',
        status: 'active',
        shift: 'evening',
        permissions: ['view', 'process_payment', 'create_order'],
        clockedIn: false,
        lastClockOut: '2026-03-29T21:30:00Z',
        lastActivity: '2026-03-29T21:30:00Z',
        joinedDate: '2026-02-15T00:00:00Z',
        createdAt: '2026-02-15T00:00:00Z',
        updatedAt: '2026-03-29T21:30:00Z'
      },
      {
        id: 'stf_009',
        restaurantId: 'rst_005',
        name: 'Chioma Nwachukwu',
        email: 'chioma@poundedyam.com',
        phone: '+234 809 999 9999',
        role: 'manager',
        status: 'active',
        shift: 'morning',
        permissions: ['view', 'create', 'edit', 'delete', 'manage_staff', 'view_reports'],
        clockedIn: true,
        lastClockIn: '2026-03-30T08:15:00Z',
        lastActivity: '2026-03-30T11:15:00Z',
        joinedDate: '2026-01-30T00:00:00Z',
        createdAt: '2026-01-30T00:00:00Z',
        updatedAt: '2026-03-30T11:15:00Z'
      },
      {
        id: 'stf_010',
        restaurantId: 'rst_006',
        name: 'Aisha Bello',
        email: 'aisha@suyaspot.com',
        phone: '+234 810 000 0000',
        role: 'manager',
        status: 'active',
        shift: 'evening',
        permissions: ['view', 'create', 'edit', 'delete', 'manage_staff', 'view_reports'],
        clockedIn: false,
        lastClockOut: '2026-03-29T23:00:00Z',
        lastActivity: '2026-03-29T23:00:00Z',
        joinedDate: '2026-02-20T00:00:00Z',
        createdAt: '2026-02-20T00:00:00Z',
        updatedAt: '2026-03-29T23:00:00Z'
      },
      {
        id: 'stf_011',
        restaurantId: 'rst_006',
        name: 'James Wilson',
        email: 'james@suyaspot.com',
        phone: '+234 811 111 1111',
        role: 'chef',
        status: 'active',
        shift: 'evening',
        permissions: ['view', 'update_order_status', 'manage_inventory'],
        clockedIn: false,
        lastClockOut: '2026-03-29T23:00:00Z',
        lastActivity: '2026-03-29T23:00:00Z',
        joinedDate: '2026-02-25T00:00:00Z',
        createdAt: '2026-02-25T00:00:00Z',
        updatedAt: '2026-03-29T23:00:00Z'
      }
    ];
  }

  getMockStaff(restaurantId) {
    const allStaff = this.getAllStoredStaff();
    return allStaff.filter(s => s.restaurantId === restaurantId);
  }
}

export const staffApi = new StaffApi();