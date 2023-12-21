import { Module } from '@nestjs/common';
import { ChapterModule } from './chapter';
import { CloudModule } from './cloud';
import { ComicModule } from './comic';
import { CommentModule } from './comment';


import { ImageModule } from './image';
import { RatingModule } from './rating';


import { ConnectedModule } from './connected/connected.module';
import { ConversationModule } from './conversation/conversation.module';
import { FollowerModule } from './follower/follower.module';
import { ForumModule } from './forum/forum.module';
import { HistoryModule } from './history/history.module';
import { JoinedConversationModule } from './joined-conversation/joined-conversation.module';
import { MessagesModule } from './messages/messages.module';
import { TopicModule } from './topic';
import { UserModule } from './user';

import { WalletModule } from './wallet';
import { FavoriteModule } from './favorite/favorite.module';

@Module({
  imports: [
    ImageModule,
    WalletModule,
    ComicModule,
    TopicModule,
    ChapterModule,
    CommentModule,
    //
    // FavoriteModule,
    UserModule,
    CloudModule,
    RatingModule,
    MessagesModule,

    ConversationModule,
    FollowerModule,
    HistoryModule,

    ConnectedModule,
    JoinedConversationModule,
    ForumModule,
    FavoriteModule,
  ],
  controllers: [],
  providers: [],
  exports: [
    ImageModule,
    WalletModule,
    ComicModule,
    TopicModule,
    ChapterModule,
    CommentModule,
    //
   // FavoriteModule,
    UserModule,
    CloudModule,
    RatingModule,
    MessagesModule,

    ConversationModule,
    FollowerModule,
    HistoryModule,

    ConnectedModule,
    JoinedConversationModule,
    ForumModule,
  ],
})
export class ModulesApiModule {}
