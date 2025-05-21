<template>
  <div class='modal'>
    <div class='modal-content'>
      <div class='modalRow'>
        <label>{{  `Visibility: ` }}</label>
        <select v-model='visible' class='visibility'>
          <option :value='true'>Public</option>
          <option :value='false'>Private</option>
        </select>
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
        <div class='modalColumn wide' v-if='!visible'>
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
        <button class='update' @click='handleUpdate'>Update</button>
      </div>
      <div class='modalRow tall' v-if='artifactType === "audioEvent"'>
        {{ warningText }}
      </div>
    </div>
  </div>
</template>
<script lang='ts'>

import { defineComponent, PropType } from 'vue';
import { UserType } from '@shared/types';
import { updateVisibility, getAllUsers } from '@/js/serverCalls';

type PermissionsModalDataType = {
  visible: boolean,
  allUsers: UserType[],
  selectedViewers: (UserType | undefined)[],
  selectedEditors: (UserType | undefined)[],
  userSelectHeight: number,
  warningText: string,
}

export default defineComponent({
  name: 'PermissionsModal',
  data(): PermissionsModalDataType {
    return {
      visible: true,
      allUsers: [],
      selectedViewers: [],
      selectedEditors: [],
      userSelectHeight: 100,
      warningText: 'Warning: Updating the permissions of an audioEvent will \
      overwrite the permissions of all recordings associated with that \
      audioEvent.'
    }
  },
  props: {
    navHeight: {
      type: Number,
      required: true
    },
    explicitPermissions: {
      type: Object as PropType<{
        publicView: boolean,
        edit: string[],
        view: string[]
      }>,
      required: true
    },
    artifactType: {
      type: String as PropType<(
        'audioEvent' | 'audioRecording' | 'transcription')
        >,
      required: true
    },
    artifactID: {
      type: String,
      required: true
    }
  },

  async created() {
    this.visible = this.explicitPermissions.publicView;
    
    try {
      this.allUsers = await getAllUsers();
      this.allUsers.sort((a, b) => {
        if (a.family_name < b.family_name) return -1;
        else if (a.family_name > b.family_name) return 1;
        else if (a.given_name < b.given_name) return -1;
        else if (a.given_name > b.given_name) return 1;
        else return 0
      })
      this.selectedEditors = this.explicitPermissions.edit.map(userID => {
        return this.allUsers.find(user => user._id === userID);
      });
      this.selectedViewers = this.explicitPermissions.view.map(userID => {
        return this.allUsers.find(user => user._id === userID);
      });
    } catch (error) {
      console.log(error);
    }
  },
  mounted() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.$emit('close');
      }
    });

    window.addEventListener('click', (e) => {
      if (e.target === document.querySelector('.modal')) {
        this.$emit('close');
      }
    });

  },

  methods: {
    async handleUpdate() {
      const edit = this.selectedEditors
        .filter(editor => editor !== undefined)
        .map(editor => editor!._id) as string[];
      const view = this.selectedViewers
        .filter(viewer => viewer !== undefined)
        .map(viewer => viewer!._id) as string[];
      const explicitPermissions = {
        publicView: this.visible,
        edit,
        view
      }
      const exp = explicitPermissions;
      await updateVisibility(this.artifactType, this.artifactID, exp);
      this.$emit('close');
    },

    addViewer() {
      this.selectedViewers.push(undefined);
    },

    addEditor() {
      this.selectedEditors.push(undefined);
    },
  },

  unmounted() {
    // remove event listener for keydown
    window.removeEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.$emit('close');
      }
    });

    //  if you click outside modal-content, it closes the modal
    window.removeEventListener('click', (e) => {
      if (e.target === document.querySelector('.modal')) {
        this.$emit('close');
      }
    });
  }
})
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
  height: 250px;
  width: 500px;
  display: flex;
  flex-direction: column;
  justify-content: top;
}

.modalRow {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 32px;
}
.modalRow.users {
  margin-top: 10px;
  align-items: top;
  height: v-bind(userSelectHeight + 30 + 'px');
  border: 1px solid black;
}

.modalRow.tall {
  height: 50px;

}

label {
  margin-right: 5px;
  text-align: right;
}

select {
  margin-left: 5px;
}

select.visibility {
  width: 80px;
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

.addButton {
  height: 30px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

}

select {
  margin-right: 5px;
  width: 150px;
}

button.update {
  margin-top: 5px;
}


</style>
