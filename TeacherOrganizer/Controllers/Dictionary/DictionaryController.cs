﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TeacherOrganizer.Interefaces;
using TeacherOrganizer.Models.DictionaryModels;

namespace TeacherOrganizer.Controllers.Dictionary
{
    [Route("api/[controller]")]
    public class DictionaryController : ControllerBase
    {
        private readonly IDictionaryService _dictionaryService;
        public DictionaryController(IDictionaryService dictionaryService)
        {
            _dictionaryService = dictionaryService;
        }

        // POST: api/Dictionary
        [HttpPost]
        [Authorize(Roles = "Teacher, Student")]
        public async Task<IActionResult> CreateDictionary([FromBody] DictionaryCreateModel dictionary)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var userId = User.FindFirstValue(ClaimTypes.Name);
            if (string.IsNullOrEmpty(userId)) return Unauthorized(new { Message = "User ID not found in token." });

            try
            {
                var newDictionary = _dictionaryService.CreateDictionaryAsync(dictionary, userId);
                return CreatedAtAction(nameof(GetDictionaryById), new { id = newDictionary.Id }, newDictionary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Error creating dictionary", Details = ex.Message });
            }
        }

        // GET: api/Dictionary
        [HttpGet]
        [Authorize(Roles = "Teacher, Student")]
        public async Task<IActionResult> GetDictionaries()
        {
            var userId = User.FindFirstValue(ClaimTypes.Name);
            if (string.IsNullOrEmpty(userId)) return Unauthorized(new { Message = "User ID not found in token." });

            try
            {
                var dictionary = await _dictionaryService.GetDictionariesByUserAsync(userId);
                if (dictionary == null) return NotFound();
                return Ok(dictionary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Error retrieving dictijnaries", Details = ex.Message });
            }
        }

        // GET: api/Dictionary/{id}
        [HttpGet("{id}")]
        [Authorize(Roles = "Teacher, Student")]
        public async Task<IActionResult> GetDictionaryById(int id)
        {
            try
            {
                var dictionary = await _dictionaryService.GetDictionaryByIdAsync(id);
                if (dictionary == null)
                {
                    return NotFound(new {Message = "Dictionary not found"});
                }
                return Ok(dictionary);
            }
            catch (Exception ex)
            {

                return StatusCode(500, new { Message = "Error retrieving dictionary", Details = ex.Message });
            }
        }
    }
}
