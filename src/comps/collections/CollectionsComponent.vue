<template>
  <div 
    class='collectionsMain' 
    @click='handleClick'
    v-if='!collectionSelected'
    >
    <div class='sidePanel'>
      <div class='buttonHolder'>
        <button @click='handleNewCollectionClick'>New Collection</button>
      </div>
    </div>
    <div 
      class='colRowHolder' 
      :style='{"--navHeight": navHeight + "px"}'
      
      >
      <div 
        class='collectionRow'
        v-for='(collector, index) in collectors' 
        :key='index'
        :style='{"--sidePanelWidth": sidePanelWidth + "px" }'
        >
        <div class='userName'>{{ collector.userName }}</div>
        <div class='collections'>
          <div 
            v-for='(collection, cIdx) in collector.collections' 
            :key='cIdx' 
            :class='`collection ${ 
              cIdx === collector.collections.length - 1 ? 
              "last" : 
              "" 
              }`'
            :id='collection._id'
            :style='{ 
              "background-color": collection.color,
              "color": getContrastingTextColor(collection.color!)
              }'
              @contextmenu='handleContextClick(collection, $event)'
              @dblclick='openCollection(collection)'
            >
            <div class='title'>{{ collection.title }}</div>
            <div class='description'>{{ collection.description }}</div>
            <div class='purpose'>{{ collection.purpose }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <CollectionViewer
      ref='collectionViewer'
      v-if='collectionSelected && selectedCollection !== undefined'
      :collection='selectedCollection'
      :navHeight='navHeight'
      :owner='selectedCollection.userID === $store.state.userID'
      @closeCollection='collectionSelected = false'
      @editCollection='editCollection'
      @updateCollections='updateCollections'
      />
  <NewCollectionModal 
    v-if='newCollectionModalOpen'
    @closeModal='closeModal'
    :navHeight='navHeight'
    :editing='editingCollectionStatus'
    :collection='selectedCollection'
    />
    <ContextMenu
      :x='contextMenuX'
      :y='contextMenuY'
      :choices='contextMenuOptions'
      :closed='!contextMenuOpen'
      @close='contextMenuOpen = false'
      />
</template>

<script lang='ts'>

import { CollectionType, ContextMenuOptionType } from '@shared/types';
import { 
  deleteCollection, 
  getAllCollections,
  enrollUserInCollection 
} from '@/js/serverCalls.ts';
const collectionsDir = '@/comps/collections/';
import NewCollectionModal from '@/comps/collections/NewCollectionModal.vue';
import { getContrastingTextColor } from '@/ts/utils';
import { defineComponent } from 'vue';
import ContextMenu from '@/comps/ContextMenu.vue';
import CollectionViewer from '@/comps/collections/CollectionViewer.vue';

type CollectionsComponentDataType = {
  newCollectionModalOpen: boolean,
  allCollections: CollectionType[],
  collectors: {
    userID: string,
    userName: string,
    collections: CollectionType[],
  }[],
  collectionBoxSize: number,
  collectionsRowHeight: number,
  userNameHeight: number,
  sidePanelWidth: number,
  collectorsLength: number,
  contextMenuOpen: boolean,
  contextMenuX: number,
  contextMenuY: number,
  contextMenuOptions: ContextMenuOptionType[],
  editingCollectionStatus: boolean,
  selectedCollection: CollectionType | undefined,
  collectionSelected: boolean
}

export default defineComponent({
  data(): CollectionsComponentDataType {
    return {
      newCollectionModalOpen: false,
      allCollections: [],
      collectors: [],
      collectionBoxSize: 250,
      collectionsRowHeight: 330,
      userNameHeight: 50,
      sidePanelWidth: 200,
      collectorsLength: 1,
      contextMenuOpen: false,
      contextMenuX: 0,
      contextMenuY: 0,
      contextMenuOptions: [],
      editingCollectionStatus: false,
      selectedCollection: undefined,
      collectionSelected: false
      
    };
  },

  components: {
    NewCollectionModal,
    ContextMenu,
    CollectionViewer
  },

  props: {
    navHeight: {
      type: Number,
      required: true
    }
  },

  async mounted() {

    // get route
    const queryParams = this.$route.query
    if (queryParams.inviteCode !== undefined) {
      // TODO add user to collection db via server call, and navigate them to collection
      try {
        const userID = this.$store.state.userID!;
        const inviteCode = queryParams.inviteCode as string;
        const res = await enrollUserInCollection(userID, inviteCode);
        console.log(res);
      } catch (error) {
        console.log(error);
      }
    }



    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (this.contextMenuOpen === true) {
          this.contextMenuOpen = false;
        }
      }
      


    });
    // gather all collections, filter to only show collections that the user 
    // has permission to view, split them up according to their creator, and 
    // display basically a list of creator names, below each of which is a 
    // scrolling horizontal set of boxes representing each collection, with its
    // title and description and purpose. 
    try {
      await this.resetCollections();
    } catch (error) {
      console.log(error);
    }
    

  },

  unmounted() {
    window.removeEventListener('keydown', () => {});
  },

  methods: {

    async resetCollections() {
      try {
        this.allCollections = await getAllCollections();
        this.allCollections = this.allCollections.filter(coll => {
          const c0 = coll.permissions.publicView;
          const c1 = coll.userID === this.$store.state.userID;
          const c2 = coll.permissions.view.includes(this.$store.state.userID!);
          const c3 = coll.permissions.edit.includes(this.$store.state.userID!);
          return c0 || c1 || c2 || c3;
        });
        const collectorIDs = this.allCollections
          .map(coll => coll.userID)
          .filter((userID, index, self) => {
            return self.indexOf(userID) === index;
          });
        this.collectors = collectorIDs.map(collectorID => {
          const collectorName = this.allCollections.find(coll => {
            return coll.userID === collectorID;
          })!.userName!;
          const collections = this.allCollections.filter(coll => {
            return coll.userID === collectorID;
          });
          return {
            userID: collectorID,
            userName: collectorName,
            collections
          };
        });
        this.collectorsLength = this.collectors.length;
      } catch (error) {
        console.log(error);
      }
    },

    editCollection() {
      this.editingCollectionStatus = true; 
      this.newCollectionModalOpen = true;
      this.collectionSelected = false;
    },

    handleNewCollectionClick() {
      this.editingCollectionStatus = false;
      this.newCollectionModalOpen = true;
      this.collectionSelected = false;
    },

    handleClick() {
      if (this.contextMenuOpen === true) {
        this.contextMenuOpen = false;
      }
    },

    async closeModal() {
      this.newCollectionModalOpen = false;
      try { 
        await this.updateCollections();

      } catch (error) {
        console.log(error);
      }
      
    },

    getContrastingTextColor,

    async updateCollections() {
      try {
        this.allCollections = await getAllCollections();
        this.allCollections = this.allCollections.filter(coll => {
          const c0 = coll.permissions.publicView;
          const c1 = coll.userID === this.$store.state.userID;
          const c2 = coll.permissions.view.includes(this.$store.state.userID!);
          const c3 = coll.permissions.edit.includes(this.$store.state.userID!);
          return c0 || c1 || c2 || c3;
        });
        const collectorIDs = this.allCollections
          .map(coll => coll.userID)
          .filter((userID, index, self) => {
            return self.indexOf(userID) === index;
          });
        this.collectors = collectorIDs.map(collectorID => {
          const collectorName = this.allCollections.find(coll => {
            return coll.userID === collectorID;
          })!.userName!;
          const collections = this.allCollections.filter(coll => {
            return coll.userID === collectorID;
          });
          return {
            userID: collectorID,
            userName: collectorName,
            collections
          };
        });

        if (this.selectedCollection !== undefined) {
          const scId = this.selectedCollection._id;
          this.selectedCollection = this.allCollections.find(coll => {
            return coll._id === scId;
          });
        }
      } catch (error) {
        console.log(error);
      }
    },

    openCollection(collection: CollectionType) {
      this.selectedCollection = collection;
      this.collectionSelected = true;

    },
  
    handleContextClick(collection: CollectionType, event: MouseEvent) {
      event.preventDefault();
      const enabled = collection.userID === this.$store.state.userID;
      this.contextMenuX = event.clientX;
      this.contextMenuY = event.clientY;

      this.contextMenuOptions = [
        { 
          text: 'Open',
          action: () => {
            this.openCollection(collection);
            this.contextMenuOpen = false;
          },
          enabled: true
        },
        {
          text: 'Edit',
          action: () => {   
            this.selectedCollection = collection;
            this.editingCollectionStatus = true;
            this.newCollectionModalOpen = true;
            this.contextMenuOpen = false;
          },
          enabled
        },
        {
          text: 'Delete',
          action: async () => {
            try {
              const res = await deleteCollection(collection._id!);
              console.log(res);
              await this.updateCollections();
            } catch (error) {
              console.log(error);
            }
            this.contextMenuOpen = false;
          },
          enabled
        }
      ];
      this.contextMenuOpen = true;
    }
  }
});
</script>

<style scoped>

.collectionsMain {
  background-image: linear-gradient(black, #1e241e);
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: top;
  justify-content: left;
}

.collectionRow {
  height: v-bind(collectionsRowHeight + 'px');
  width: calc(100vw - var(--sidePanelWidth));
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #ccc;
  box-sizing: border-box;
}

.userName {
  color: white;
  font-size: 1.5em;
  margin-left: 20px;
  display: flex;
  align-items: center;
  justify-content: left;
  height: v-bind(userNameHeight + 'px');
}

.collections {
  display: flex;
  overflow-x: auto;
  flex-direction: row;
  height: v-bind(collectionsRowHeight - userNameHeight + 'px');
  width: 100%;
  align-items: center;
  justify-content: left;
}

.collection {
  width: v-bind(collectionBoxSize + 'px');
  height: v-bind(collectionBoxSize + 'px');
  min-width: v-bind(collectionBoxSize + 'px');
  min-height: v-bind(collectionBoxSize + 'px');
  background-color: #D2B48C;
  box-sizing: border-box;
  border: 1px solid #ccc;
  margin-left: 20px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: left;
  justify-content: left;
  position: relative;
}

.collection.last {
  margin-right: 20px;
}

.collection:hover {
  background-color: #ccc!important;
  cursor: pointer;
  color: black!important;
}

.title {
  font-size: 1.5em;
  /* color: black; */
  margin-top: 10px;
  width: 100%;
  text-align: left;
}

.description {
  font-size: 1em;
  /* color: black; */
  margin-top: 10px;
  width: 100%;
  text-align: left;
}

.sidePanel {
  min-width: v-bind(sidePanelWidth + 'px');
  max-width: v-bind(sidePanelWidth + 'px');
  height: 100%;
  background-color: #202621;
  border-right: 1px solid #ccc;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: top;
  border-top: 1px solid #ccc;
}

.colRowHolder {
  height: calc(100% - var(--navHeight));
  width: calc(100% - sidePanelWidth);
  display: flex;
  flex-direction: column;
  align-items: left;
  justify-content: top;
  overflow-y: auto;
  overflow-x: hidden;
  border-top: 1px solid #ccc;
  box-sizing: border-box;

}

.buttonHolder {
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.purpose {
  position: absolute;
  bottom: 10px;
  right: 10px;
  text-align: right;
}
</style>
