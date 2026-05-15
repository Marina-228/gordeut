<template>
  <div class="app">
    <h1>Страница с постами</h1>
    <my-button
      @click="showDialog"
      style="margin: 15px 0;"
    >
      Создать пользователя
    </my-button>
    <my-dialog v-model:show="dialogVisible">
        <post-form
          @create ="createPost"
        />
    </my-dialog>


    
    <post-list :posts="posts"
    @remove="removePost"
    />
  </div>
</template>

<script>
import PostForm from './components/PostForm.vue';
import PostList from '@/components/PostList.vue';
export default {
  components: {
    PostForm,
    PostList
  },

  data() {
    return {
      posts: [
        {id: 1, title: 'Javacript 1', body: 'Описание поста 1'},
        {id: 2, title: 'Javacript 2', body: 'Описание поста 2'},
        {id: 3, title: 'Javacript 3', body: 'Описание поста 3'},
        {id: 4, title: 'Javacript 4', body: 'Описание поста 4'},
      ],
      dialogVisible: false,
    }
  },
  

  methods:{
    createPost(post){
      this.posts.push(post);
      this.dialogVisible = false;
    },
    removePost(post){
      this.posts = this.posts.filter(p => p.id !== post.id)
    },
    showDialog(){
      this.dialogVisible = true;
  },
  async retchUsers(){

  }
}
}


</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.app{
  padding: 20px;
}


</style>



<template>

  <input v-model="name">
  <input v-model="surname">

  <p>{{ fullName }}</p>

</template>
