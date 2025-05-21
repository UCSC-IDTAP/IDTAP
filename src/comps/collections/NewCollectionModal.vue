<template>
  <div class='modal'>
    <div class='modal-content'>
      <div class='modalRow'>
        <h2>New Collection</h2>
      </div>
      <div class='modalRow'>
        <label for='title'>Title: </label>
        <input type='text' id='title' v-model='title'>
      </div>
      <div class='modalRow'>
        <label for='description'>Description: </label>
        <input type='text' id='description' v-model='description'>
      </div>
      <div class='modalRow'>
        <label for='purpose'>Purpose: </label>
        <select id='purpose' v-model='purpose'>
          <option 
            v-for='(purpose, i) in purposeChoices' 
            :key='i'
            :value='purpose'
            >
            {{purpose}}
          </option>
        </select>
        <label for='color'>Color: </label>
        <input type='color' id='color' v-model='color'>
      </div>
      <div class='modalRow'>
        <label for='publicView'>Visibility: </label>
        <div class='modalColumn'>
          <div class='subRow'>
            <input 
              type='radio' 
              id='publicView' 
              :value='true' 
              name='publicView'
              v-model='publicView'>
            <label for='publicView'>Public</label>
          </div>
          <div class='subRow'>
            <input 
              type='radio' 
              id='privateView' 
              :value='false' 
              name='publicView'
              v-model='publicView'>
            <label for='privateView'>Private</label>
          </div>
        </div>
      </div>
      <div class='modalRow users' >
        <div class='modalColumn wide'>
          <div class='labelBox'>
            <label for ='editors'>Editors</label>
          </div>
          <div class='userSelectColumn'>
            <div class='usersBox'>
              <div v-for='(editor, i) in selectedEditors' :key='i'>
                <select v-model='selectedEditors[i]'>
                  <option 
                    v-for='(user, j) in allUsers' 
                    :key='j'
                    :value='user'
                    >
                    {{ `${user.name} , (${user.email})` }}
                  </option>
                </select>
                <button @click='selectedEditors.splice(i, 1)'>-</button>
              </div>
            </div>
            <div class='addButton'>
              <button @click='addEditor'>+</button>
            </div>
          </div>
        </div>
        <div class='modalColumn wide' v-if='!publicView'>
          <div class='labelBox'>
            <label for='viewers'>Viewers</label>
          </div>
          <div class='userSelectColumn'>
            <div class='usersBox'>
              <div v-for='(viewer, i) in selectedViewers' :key='i'>
                <select v-model='selectedViewers[i]'>
                  <option 
                    v-for='(user, j) in allUsers' 
                    :key='j'
                    :value='user'
                    >
                    {{ `${user.name} , (${user.email})` }}
                  </option>
                </select>
                <button @click='selectedViewers.splice(i, 1)'>-</button>
              </div>
            </div>
            <div>
              <button @click='addViewer'>+</button>
            </div>
          </div>
        </div>
      </div>
      <div class='modalRow'>
        <button @click='create' v-if='!editing'>Create</button>
        <button @click='edit' v-if='editing'>Update</button>
        <button @click='close'>Close</button>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { CollectionType, UserType } from '@shared/types';
import { 
  getAllUsers, 
  createCollection, 
  updateCollection 
} from '@/js/serverCalls.ts';
import { PropType } from 'vue';
type NewCollectionModalDataType = {
  purposeChoices: CollectionType['purpose'][],
  title: string,
  description: string,
  publicView: boolean,
  purpose: CollectionType['purpose'],
  allUsers: UserType[],
  selectedViewers: (UserType | undefined)[],
  selectedEditors: (UserType | undefined)[],
  userSelectHeight: number,
  color: string,
}

export default defineComponent({
  data(): NewCollectionModalDataType {
    return {
      purposeChoices: [
        'Pedagogical', 
        'Research', 
        'Appreciative', 
        'Creative', 
        'Other'
      ],
      title: '',
      description: '',
      publicView: false,
      purpose: 'Research',
      allUsers: [],
      selectedViewers: [],
      selectedEditors: [],
      userSelectHeight: 100,
      color: '#D2B48C',
    };
  },

  async mounted() {
    // escape key closes modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
    // or if you click outside the modal-content, it closes the modal
    window.addEventListener('click', (e) => {
      if (e.target === this.$el) this.close();
    });
    try {
      this.allUsers = await getAllUsers();
      this.allUsers = this.allUsers.filter(user => {
        return user._id !== this.$store.state.userID
      });
      this.allUsers.sort((a, b) => {
        if (a.family_name < b.family_name) return -1;
        else if (a.family_name > b.family_name) return 1;
        else if (a.given_name < b.given_name) return -1;
        else if (a.given_name > b.given_name) return 1;
        else return 0
      })
    } catch (error) {
      console.log(error);
    }
    
    if (this.editing && this.collection !== undefined) {
      this.title = this.collection.title;
      this.description = this.collection.description!;
      this.publicView = this.collection.permissions.publicView;
      this.purpose = this.collection.purpose;
      this.color = this.collection.color!;
      this.selectedEditors = this.collection.permissions.edit.map(id => {
        return this.allUsers.find(user => user._id === id);
      });
      this.selectedViewers = this.collection.permissions.view.map(id => {
        return this.allUsers.find(user => user._id === id);
      });
    }
  },

  unmounted() {
    window.removeEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
    window.removeEventListener('click', (e) => {
      if (e.target === this.$el) this.close();
    });
  },

  props: {
    navHeight: {
      type: Number,
      required: true
    },
    editing: {
      type: Boolean,
      required: true
    },
    collection: {
      type: Object as PropType<CollectionType>,
      required: false
    }
  },

  methods: {

    addViewer() {
      this.selectedViewers.push(undefined);
    },

    addEditor() {
      this.selectedEditors.push(undefined);
    },

    async create() {
      const viewers = this.selectedViewers.filter(user => {
        return user !== undefined
      }) as UserType[];
      const editors = this.selectedEditors.filter(user => {
        return user !== undefined
      }) as UserType[];
      const viewerIds = viewers.map(user => user._id);
      const editorIds = editors.map(user => user._id);
      const collection: CollectionType = {
        title: this.title,
        userID: this.$store.state.userID!,
        description: this.description,
        permissions: {
          view: viewerIds,
          edit: editorIds,
          publicView: this.publicView
        },
        purpose: this.purpose,
        audioRecordings: [],
        audioEvents: [],
        transcriptions: [],
        color: this.color,
      };
      const response = await createCollection(collection);
      this.$emit('closeModal');

    },

    async edit() {
      const viewers = this.selectedViewers.filter(user => {
        return user !== undefined
      }) as UserType[];
      const editors = this.selectedEditors.filter(user => {
        return user !== undefined
      }) as UserType[];
      const viewerIds = viewers.map(user => user._id);
      const editorIds = editors.map(user => user._id);
      const collection: CollectionType = {
        _id: this.collection!._id,
        title: this.title,
        userID: this.$store.state.userID!,
        description: this.description,
        permissions: {
          view: viewerIds,
          edit: editorIds,
          publicView: this.publicView
        },
        purpose: this.purpose,
        audioRecordings: this.collection!.audioRecordings,
        audioEvents: this.collection!.audioEvents,
        transcriptions: this.collection!.transcriptions,
        color: this.color,
      };
      try {
        await updateCollection(collection);
      } catch (error) {
        console.log(error);
      }
      this.$emit('closeModal');
    },

    close() {
      this.$emit('closeModal');
    }
    
  }
});
</script>

<style scoped>

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3;
  margin-top: v-bind(navHeight + 'px');
}

.modal-content {
  background-color: lightgrey;
  padding: 20px;
  border-radius: 4px;
  height: 400px;
  width: 600px;
  display: flex;
  flex-direction: column;
  justify-content: top;

}


.modalRow {
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  height: 50px;
}

.modalColumn {
  display: flex;
  flex-direction: column;
  justify-content: left;
  align-items: left;
  height: 50px;
}

.wide {
  width: 250px;
  height: v-bind(userSelectHeight + 30 + 'px');

}

.labelBox > label {
  text-align: center;
}

.subRow {
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  height: 50px;
}

.subRow > label {
  text-align: left;
  margin-left: 5px;
}

label {
  min-width: 100px;
  width: 100px;
  text-align: right;
  margin-right: 10px;
}

input[type=text] {
  width: 400px;
}

select {
  margin-right: 5px;
  width: 150px;
}

.userSelectColumn {
  display: flex;
  flex-direction: column;
  justify-content: left;
  align-items: left;
  height: v-bind(userSelectHeight + 'px');

  width: 100%;;
}

.usersBox {
  display: flex;
  flex-direction: column;
  justify-content: left;
  align-items: left;
  max-height: v-bind(userSelectHeight - 30 + 'px');
  width: 200px;
  margin-bottom: 5px;
  overflow-y: scroll;
}

.labelBox {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 30px;
  min-height: 30px;
  /* width: 200px; */
}

.modalRow.users {
  margin-top: 10px;
  align-items: top;
  height: v-bind(userSelectHeight + 30 + 'px');
  border: 1px solid black;
}

.addButton {
  height: 30px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

}
</style>
