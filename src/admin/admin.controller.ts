import { da } from '@faker-js/faker';
import {
  Controller,
  Get,
  Param,
  Query,
  Render,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuardAmin } from 'src/core/guards/auth.guard.admin';
import { Chapter } from 'src/entities';
import { ChapterService, ComicService, TopicService } from 'src/modules';
import { UuidComicDTO } from 'src/modules/chapter/dto';
import { ForumService } from 'src/modules/forum/forum.service';

@Controller()
export class AdminController {
  constructor(
    // private readonly authService: AuthService,
    // private readonly userService: UserService,
    // private readonly jwtService: JWTService,
    // private readonly mailService: MailService,
    // private readonly walletService: WalletService,
    private readonly comicService: ComicService,
    private readonly chapterService: ChapterService,
    private readonly fourmService: ForumService,
    private readonly topicService: TopicService
  ) {}

  @Get('login')
  @Render('login')
  async login() {}

  @Get('home')
  @Render('index')
  @UseGuards(AuthGuardAmin)
  async home() {}

  @Get('comic')
  @Render('comic')
  @UseGuards(AuthGuardAmin)
  async comic() {}

  @Get('addcomic')
  @Render('addcomic')
  @UseGuards(AuthGuardAmin)
  async addcomic() {}

  @Get('comic/detail_comic')
  @UseGuards(AuthGuardAmin)
  async detail_comic(
    @Query('comic_uuid') comic_uuid: string,
    @Res() res: Response
  ) {
    const data = await this.comicService.getDetailComicByUuidV2(comic_uuid);

    const chapter = await this.chapterService.getAllChapterByComicUuId(
      comic_uuid
    );
    // console.log(chapter);
    res.render('detail_comic', { data: data[0], chapter: chapter });
  }

  @Get('detail_chapter/:comic_uuid')
  @UseGuards(AuthGuardAmin)
  async detail_chapter(
    @Query('chapter_number') chapter_number = 0,
    @Param() comic_uuid: UuidComicDTO,
    @Res() res: Response
  ) {
    const chapter = await this.chapterService.getDetailChapter(
      comic_uuid.comic_uuid,
      chapter_number
    );

    console.log(chapter);
    res.render('detail_chapter', { chapter: chapter });
  }

  @Get('user')
  @Render('user')
  @UseGuards(AuthGuardAmin)
  async user() {}

  @Get('user/detail_user')
  @Render('detail_user')
  @UseGuards(AuthGuardAmin)
  async detail_user() {}

  @Get('fourm')
  @Render('fourm')
  @UseGuards(AuthGuardAmin)
  async fourm() {}

  @Get('gender')
  @Render('gender')
  @UseGuards(AuthGuardAmin)
  async gender() {}

  @Get('gender/add_gender')
  @Render('add_gender')
  @UseGuards(AuthGuardAmin)
  async addgender() {}

  @Get('gender/detail_gender')
  @Render('detail_gender')
  @UseGuards(AuthGuardAmin)
  async detail_gender(@Query('gender_uuid') gender_uuid: string) {
    console.log(gender_uuid);

    const data = await this.topicService.getTopicById(gender_uuid);
    console.log(data);
    return { data: data };
  }

  @Get('chapter/add_chapter')
  @Render('add_chapter')
  @UseGuards(AuthGuardAmin)
  async add_chapter() {}
}
