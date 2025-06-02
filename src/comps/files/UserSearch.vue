<template>
  <div class="user-search">
    <!-- Search input -->
    <input
      v-model="searchTerm"
      type="text"
      class="search-input"
      placeholder="Search users..."
    />

    <!-- Filtered results -->
    <ul v-if="searchTerm" class="results-list">
      <li
        v-for="user in filteredUsers"
        :key="user._id"
        class="result-item"
        @click="addUser(user)"
      >
        <span class="result-text">{{ user.name }} &lt;{{ user.email }}&gt;</span>
      </li>
      <li v-if="filteredUsers.length === 0" class="no-results">
        No matching users
      </li>
    </ul>

    <!-- Included users (tags) -->
    <div class="included-list" v-if="includedUserObjects.length">
      <span
        v-for="user in includedUserObjects"
        :key="user._id"
        class="included-tag"
      >
        <span class="included-text">
          {{ user.name }} &lt;{{ user.email }}&gt;
        </span>
        <button class="remove-btn" @click="removeUser(user._id)">×</button>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType } from 'vue';
import { UserType } from '@shared/types';

export default defineComponent({
  name: 'UserSearch',
  props: {
    users: {
      type: Array as PropType<UserType[]>,
      required: true
    },
    includedUsers: {
      type: Array as PropType<string[]>,
      required: true
    }
  },
  emits: ['addUser', 'removeUser'],
  setup(props, { emit }) {
    const searchTerm = ref('');

    const filteredUsers = computed(() => {
		const term = searchTerm.value.trim().toLowerCase();
		if (!term) return [];

		return props.users
			// first, remove any already‐included users
			.filter(u => !props.includedUsers.includes(u._id))
			// then keep those whose name OR email contains the term
			.filter(u => {
			const nameMatch  = u.name.toLowerCase().includes(term);
			const emailMatch = u.email.toLowerCase().includes(term);
			return nameMatch || emailMatch;
		});
	});

    const includedUserObjects = computed(() => {
      return props.includedUsers
        .map(id => props.users.find(u => u._id === id))
        .filter((u): u is UserType => u !== undefined);
    });

    function addUser(user: UserType) {
      emit('addUser', user._id);
      // Clear the search bar so the user can type again
      searchTerm.value = '';
    }

    function removeUser(id: string) {
      emit('removeUser', id);
    }

    return {
      searchTerm,
      filteredUsers,
      addUser,
      removeUser,
      includedUserObjects
    };
  }
});
</script>

<style scoped>
.user-search {
  display: flex;
  flex-direction: column;
  height: 100px;
  padding: 4px;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}

/* Search input styling */
.search-input {
  width: 100%;
  box-sizing: border-box;
  padding: 4px 6px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* Results list: positioned below input, scrolls if too many */
.results-list {
  position: absolute;
  top: 36px;
  left: 0;
  width: 100%;
  z-index: 10;
  margin: 0;
  padding: 0;
  padding-left: 0;
  list-style: none;
  max-height: 84px; /* limit height so overall component stays ~100px */
  overflow-y: auto;
}

.result-item {
  padding: 2px 4px;
  cursor: pointer;
  font-size: 10px;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background-color: #202621;
}

.result-text {
  font-size: 10px;
}

.result-item:hover {
  background-color: #f0f0f0;
}

.no-results {
  padding: 2px 4px;
  font-size: 13px;
  color: #888;
}

/* Included users shown as tags */
.included-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
  overflow-y: auto;
  max-height: 60px;
  background-color: transparent;
}

.included-tag {
  background-color: transparent !important;
  border: 1px solid #e0e0e0;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 12px;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: none;
  height: 16px;
}

.included-text {
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - 24px);
}

.remove-btn {
  background: transparent;
  border: none;
  margin-left: 4px;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 0;
  color: white;
}

.remove-btn:hover {
  color: red;
}
</style>
